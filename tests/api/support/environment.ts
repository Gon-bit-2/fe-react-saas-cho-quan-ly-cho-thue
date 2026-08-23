export type Credentials = {
  email: string
  password: string
}

export type ApiEnvironment = {
  baseUrl: string
  admin: Credentials
  landlord: Credentials
  tenant: Credentials
  enableUploads: boolean
}

function required(name: string) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Copy .env.api.example to .env.api.local.`)
  }
  return value
}

export function getApiEnvironment(): ApiEnvironment {
  return {
    baseUrl: process.env.E2E_API_BASE_URL?.trim() || 'http://localhost:1174',
    admin: { email: required('E2E_ADMIN_EMAIL'), password: required('E2E_ADMIN_PASSWORD') },
    landlord: { email: required('E2E_LANDLORD_EMAIL'), password: required('E2E_LANDLORD_PASSWORD') },
    tenant: { email: required('E2E_TENANT_EMAIL'), password: required('E2E_TENANT_PASSWORD') },
    enableUploads: process.env.E2E_ENABLE_UPLOADS === 'true',
  }
}

export function createRunId() {
  const compactTime = new Date()
    .toISOString()
    .replace(/[-:.TZ]/gu, '')
    .slice(0, 14)
  const random = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `API-E2E-${compactTime}-${random}`
}
