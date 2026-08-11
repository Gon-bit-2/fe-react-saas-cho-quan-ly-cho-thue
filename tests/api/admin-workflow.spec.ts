import { expect, request as playwrightRequest, test, type APIRequestContext } from '@playwright/test'
import { ApiClient, expectStatus, json, rows } from './support/api-client'
import { getPreparedApiSessions } from './support/global-setup'
import { createRunId, getApiEnvironment } from './support/environment'
import { publicRunContext, type RunContext } from './support/run-context'

test.describe.serial('@flows admin, plans and tenant onboarding through real APIs', () => {
  const context: RunContext = { runId: createRunId(), cleanup: [] }
  let admin: ApiClient
  let landlord: ApiClient
  let requestContext: APIRequestContext

  test.beforeAll(async () => {
    const environment = getApiEnvironment()
    requestContext = await playwrightRequest.newContext({
      baseURL: environment.baseUrl,
      extraHTTPHeaders: { accept: 'application/json' },
    })
    const { admin: adminSession, landlord: landlordSession } = getPreparedApiSessions()
    const membership = landlordSession.profile.tenantMembers.find(
      (item: Record<string, unknown>) => item.roleId === 'LANDLORD' && item.status === 'ACTIVE',
    )
    if (!membership) throw new Error('Landlord has no active tenant membership')
    context.tenantId = Number(membership.tenantId)
    admin = new ApiClient(requestContext, adminSession.accessToken)
    landlord = new ApiClient(requestContext, landlordSession.accessToken, context.tenantId)
  })

  // Playwright requires fixture arguments to use object destructuring.
  // eslint-disable-next-line no-empty-pattern
  test.afterAll(async ({}, testInfo) => {
    if (admin) {
      if (context.adminTenantId) {
        const response = await admin.patch(`/tenants/${context.adminTenantId}/status`, { data: { status: 'CLOSED' } })
        context.cleanup.push({
          type: 'tenant',
          id: context.adminTenantId,
          disposition: response.ok() ? 'closed' : 'cleanup-failed',
          detail: response.ok() ? undefined : `HTTP ${response.status()}`,
        })
      }
      if (context.planId) {
        const response = await admin.patch(`/plans/${context.planId}`, { data: { isActive: false } })
        context.cleanup.push({
          type: 'plan',
          id: context.planId,
          disposition: response.ok() ? 'inactive' : 'cleanup-failed',
          detail: response.ok() ? undefined : `HTTP ${response.status()}`,
        })
      }
      if (context.amenityId) {
        const response = await admin.patch(`/amenities/${context.amenityId}`, { data: { isActive: false } })
        context.cleanup.push({
          type: 'amenity',
          id: context.amenityId,
          disposition: response.ok() ? 'inactive' : 'cleanup-failed',
          detail: response.ok() ? undefined : `HTTP ${response.status()}`,
        })
      }
    }
    await testInfo.attach('api-e2e-admin-run-context.json', {
      body: Buffer.from(JSON.stringify(publicRunContext(context), null, 2)),
      contentType: 'application/json',
    })
    await requestContext?.dispose()
  })

  test('admin dashboard and user/tenant indexes are readable', async () => {
    await admin.get('/dashboard/platform/summary', { expected: 200 })
    await admin.get('/dashboard/platform/trends', { expected: 200 })
    await admin.get('/users/landlords', { expected: 200 })
    const tenantsResponse = await admin.get('/tenants', { expected: 200 })
    const tenants = rows(await json(tenantsResponse))
    expect(tenants.some((item) => Number(item.id) === context.tenantId)).toBe(true)
    await admin.get(`/tenants/${context.tenantId}`, { expected: 200 })
  })

  test('admin creates and updates a disposable service plan', async () => {
    const code = context.runId.replace(/[^A-Z0-9]/gu, '').slice(-35)
    const createResponse = await admin.post('/plans', {
      data: {
        code,
        name: `${context.runId} plan`,
        description: 'Disposable real API acceptance plan',
        priceMonthly: 99000,
        priceYearly: 990000,
        maxRooms: 25,
        maxStaff: 5,
        allowAiOcr: false,
        allowWebhookPayment: false,
        isActive: true,
      },
      expected: 201,
    })
    const plan = await json(createResponse)
    context.planId = Number(plan.id)
    expect(plan.code).toBe(code)

    const updated = await admin.patch(`/plans/${context.planId}`, {
      data: { description: `${context.runId} updated`, maxRooms: 30 },
      expected: 200,
    })
    expect((await json(updated)).maxRooms).toBe(30)
    await admin.get(`/plans/${context.planId}`, { expected: 200 })

    const availableResponse = await landlord.get('/plans/available')
    test.info().annotations.push({
      type: 'known-issue',
      description: 'GET /plans/available returns 403 to LANDLORD although the handler declares @Roles(LANDLORD)',
    })
    await expectStatus(availableResponse, 403, 'Known plan availability permission defect')
    await landlord.get('/subscriptions/me', { expected: 200 })
  })

  test('admin creates a disposable landlord tenant and exercises its lifecycle', async () => {
    expect(context.planId).toBeTruthy()
    const emailSuffix = context.runId.toLowerCase().replace(/[^a-z0-9]/gu, '')
    const response = await admin.post('/tenants', {
      data: {
        fullName: `${context.runId} landlord`,
        email: `landlord.${emailSuffix}@example.test`,
        phone: `09${Date.now().toString().slice(-8)}`,
        password: `Temp!${Date.now()}Aa`,
        tenantName: `${context.runId} tenant`,
        tenantEmail: `tenant.${emailSuffix}@example.test`,
        address: 'Disposable API E2E tenant',
        planId: context.planId,
        billingCycle: 'MONTHLY',
        autoRenew: false,
      },
      expected: 201,
    })
    const created = await json(response)
    context.adminTenantId = Number(created.id)
    expect(context.adminTenantId).toBeGreaterThan(0)

    await admin.patch(`/tenants/${context.adminTenantId}/verification`, {
      data: { verificationStatus: 'VERIFIED' },
      expected: 200,
    })
    await admin.patch(`/tenants/${context.adminTenantId}/status`, {
      data: { status: 'SUSPENDED' },
      expected: 200,
    })
    await admin.patch(`/tenants/${context.adminTenantId}/status`, {
      data: { status: 'ACTIVE' },
      expected: 200,
    })
    await admin.patch(`/tenants/${context.adminTenantId}/plan`, {
      data: { planId: context.planId, billingCycle: 'MONTHLY', autoRenew: false },
      expected: 200,
    })
    const detail = await json(await admin.get(`/tenants/${context.adminTenantId}`, { expected: 200 }))
    expect(detail.verificationStatus).toBe('VERIFIED')
    expect(detail.status).toBe('ACTIVE')
  })

  test('admin manages a disposable amenity and landlord can list it', async () => {
    const response = await admin.post('/amenities', {
      data: { name: `${context.runId} WiFi`, category: 'CONNECTIVITY', icon: 'wifi', isActive: true },
      expected: 201,
    })
    context.amenityId = Number((await json(response)).id)
    await admin.patch(`/amenities/${context.amenityId}`, {
      data: { name: `${context.runId} WiFi updated` },
      expected: 200,
    })
    const list = rows(await json(await landlord.get('/amenities', { expected: 200 })))
    expect(list.some((item) => Number(item.id) === context.amenityId)).toBe(true)
  })

  test('landlord cannot use admin-only plan mutations', async () => {
    await landlord.post('/plans', {
      data: {
        code: 'FORBIDDEN',
        name: 'Forbidden',
        priceMonthly: 0,
        priceYearly: 0,
        maxRooms: 1,
        maxStaff: 1,
      },
      expected: 403,
    })
  })
})
