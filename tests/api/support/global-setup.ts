import { request } from '@playwright/test'
import { getApiEnvironment } from './environment'
import { login, type Session } from './api-client'

const SESSION_ENV_KEY = 'E2E_API_PREPARED_SESSIONS'

type PreparedSessions = {
  admin: Session
  landlord: Session
  tenant: Session
}

export default async function globalSetup() {
  const environment = getApiEnvironment()
  const baseContextOptions = {
    baseURL: environment.baseUrl,
    extraHTTPHeaders: { accept: 'application/json' },
  }
  const [adminContext, landlordContext, tenantContext] = await Promise.all([
    request.newContext({
      ...baseContextOptions,
      extraHTTPHeaders: { ...baseContextOptions.extraHTTPHeaders, 'user-agent': 'api-e2e-playwright/admin' },
    }),
    request.newContext({
      ...baseContextOptions,
      extraHTTPHeaders: { ...baseContextOptions.extraHTTPHeaders, 'user-agent': 'api-e2e-playwright/landlord' },
    }),
    request.newContext({
      ...baseContextOptions,
      extraHTTPHeaders: { ...baseContextOptions.extraHTTPHeaders, 'user-agent': 'api-e2e-playwright/tenant' },
    }),
  ])

  try {
    const health = await adminContext.get('/')
    if (!health.ok()) throw new Error(`API preflight failed with HTTP ${health.status()}`)

    const [admin, landlord, tenant] = await Promise.all([
      login(adminContext, environment.admin),
      login(landlordContext, environment.landlord),
      login(tenantContext, environment.tenant),
    ])
    const sessions: PreparedSessions = { admin, landlord, tenant }
    process.env[SESSION_ENV_KEY] = Buffer.from(JSON.stringify(sessions), 'utf8').toString('base64')
  } finally {
    await Promise.all([adminContext.dispose(), landlordContext.dispose(), tenantContext.dispose()])
  }
}

export function getPreparedApiSessions(): PreparedSessions {
  const encoded = process.env[SESSION_ENV_KEY]
  if (!encoded) throw new Error('Prepared API sessions are missing; run with playwright.api.config.ts')
  return JSON.parse(Buffer.from(encoded, 'base64').toString('utf8')) as PreparedSessions
}
