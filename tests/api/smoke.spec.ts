import { expect, request as playwrightRequest, test, type APIRequestContext } from '@playwright/test'
import { ApiClient, expectStatus, json, type Session } from './support/api-client'
import { getPreparedApiSessions } from './support/global-setup'
import { getApiEnvironment } from './support/environment'

test.describe.serial('@smoke real API preflight', () => {
  let requestContext: APIRequestContext
  let adminSession: Session
  let landlordSession: Session
  let tenantSession: Session

  test.beforeAll(async () => {
    const environment = getApiEnvironment()
    requestContext = await playwrightRequest.newContext({
      baseURL: environment.baseUrl,
      extraHTTPHeaders: { accept: 'application/json' },
    })
    const health = await requestContext.get('/')
    await expectStatus(health, 200, 'API health')
    ;({ admin: adminSession, landlord: landlordSession, tenant: tenantSession } = getPreparedApiSessions())
  })

  test.afterAll(async () => {
    await requestContext?.dispose()
  })

  test('the three supplied accounts have the required roles and contexts', async () => {
    expect(adminSession.profile.systemRole).toBe('ADMIN')
    expect(adminSession.profile.status).toBe('ACTIVE')

    const landlordMembership = (landlordSession.profile.tenantMembers ?? []).find(
      (membership: Record<string, unknown>) => membership.roleId === 'LANDLORD' && membership.status === 'ACTIVE',
    )
    expect(landlordMembership, 'Landlord must have an ACTIVE LANDLORD tenant membership').toBeTruthy()
    expect(landlordMembership.tenant.status).toBe('ACTIVE')

    expect(tenantSession.profile.status).toBe('ACTIVE')
    expect(tenantSession.profile.renterProfile, 'Tenant account must have a renter profile').toBeTruthy()
  })

  test('refresh rotation, replay protection and logout work without exposing tokens', async () => {
    const refresh = await requestContext.post('/auth/refresh-token', {
      data: { refreshToken: tenantSession.refreshToken },
    })
    await expectStatus(refresh, 201, 'Refresh token rotation')
    const rotated = await json<{ accessToken: string; refreshToken: string }>(refresh)
    expect(rotated.refreshToken).not.toBe(tenantSession.refreshToken)

    const replay = await requestContext.post('/auth/refresh-token', {
      data: { refreshToken: tenantSession.refreshToken },
    })
    await expectStatus(replay, 401, 'Refresh token replay protection')

    const rotatedClient = new ApiClient(requestContext, rotated.accessToken)
    await rotatedClient.get('/auth/profile', { expected: 200 })
    await rotatedClient.post('/auth/logout', { data: { refreshToken: rotated.refreshToken }, expected: 201 })

    const revokedRefresh = await requestContext.post('/auth/refresh-token', {
      data: { refreshToken: rotated.refreshToken },
    })
    await expectStatus(revokedRefresh, 401, 'Refresh token after logout')
    const invalidClient = new ApiClient(requestContext, 'invalid-access-token')
    await expectStatus(await invalidClient.get('/auth/profile'), 401, 'Invalid access token')
  })

  test('role boundaries and tenant context are enforced before mutations', async () => {
    const membership = landlordSession.profile.tenantMembers.find(
      (item: Record<string, unknown>) => item.roleId === 'LANDLORD' && item.status === 'ACTIVE',
    )
    expect(membership).toBeTruthy()

    const tenantClient = new ApiClient(requestContext, tenantSession.accessToken)
    await expectStatus(await tenantClient.get('/properties'), [400, 403], 'Tenant cannot list landlord properties')

    const landlordWithoutContext = new ApiClient(requestContext, landlordSession.accessToken)
    await expectStatus(await landlordWithoutContext.get('/properties'), 400, 'Missing tenant context')
    await expectStatus(await landlordWithoutContext.get('/tenants'), 403, 'Landlord cannot access admin tenants')

    const landlordWrongContext = new ApiClient(
      requestContext,
      landlordSession.accessToken,
      Number(membership.tenantId) + 1_000_000,
    )
    await expectStatus(await landlordWrongContext.get('/properties'), 403, 'Foreign tenant context')
  })
})
