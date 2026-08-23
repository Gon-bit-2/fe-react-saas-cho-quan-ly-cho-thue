import { expect, type APIRequestContext, type APIResponse } from '@playwright/test'
import type { Credentials } from './environment'

// API responses are intentionally dynamic because tests call the live, non-generated contract.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type JsonObject = Record<string, any>
export type Session = { accessToken: string; refreshToken: string; profile: JsonObject }

type RequestOptions = {
  data?: unknown
  form?: Record<string, string | number | boolean>
  multipart?: Record<string, string | number | boolean | { name: string; mimeType: string; buffer: Buffer }>
  params?: Record<string, string | number | boolean | undefined>
  expected?: number | number[]
}

function safeUrl(response: APIResponse) {
  const url = new URL(response.url())
  return `${url.origin}${url.pathname}`
}

async function bodyForFailure(response: APIResponse) {
  const contentType = response.headers()['content-type'] ?? ''
  if (contentType.includes('application/json')) {
    const body = (await response.json()) as JsonObject
    const sanitized = { ...body }
    delete sanitized.accessToken
    delete sanitized.refreshToken
    return JSON.stringify(sanitized)
  }
  return (await response.text()).slice(0, 2_000)
}

export async function expectStatus(response: APIResponse, expected: number | number[], label?: string) {
  const statuses = Array.isArray(expected) ? expected : [expected]
  if (!statuses.includes(response.status())) {
    throw new Error(
      `${label ?? 'API request'} failed: ${safeUrl(response)} ` +
        `expected ${statuses.join('/')} but received ${response.status()}: ${await bodyForFailure(response)}`,
    )
  }
  return response
}

export async function json<T extends JsonObject = JsonObject>(response: APIResponse): Promise<T> {
  return (await response.json()) as T
}

export function rows(body: JsonObject): JsonObject[] {
  if (Array.isArray(body)) return body
  if (Array.isArray(body.data)) return body.data
  if (Array.isArray(body.items)) return body.items
  return []
}

export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private accessToken?: string,
    private tenantId?: number,
  ) {}

  setAccessToken(accessToken: string) {
    this.accessToken = accessToken
  }
  setTenantId(tenantId: number | undefined) {
    this.tenantId = tenantId
  }

  private headers() {
    return {
      ...(this.accessToken ? { authorization: `Bearer ${this.accessToken}` } : {}),
      ...(this.tenantId ? { 'x-tenant-id': String(this.tenantId) } : {}),
    }
  }

  private async send(method: 'get' | 'post' | 'patch' | 'delete', path: string, options: RequestOptions = {}) {
    const params = options.params
      ? (Object.fromEntries(Object.entries(options.params).filter((entry) => entry[1] !== undefined)) as Record<
          string,
          string | number | boolean
        >)
      : undefined
    const response = await this.request[method](path, {
      headers: this.headers(),
      data: options.data,
      form: options.form,
      multipart: options.multipart,
      params,
    })
    if (options.expected !== undefined)
      await expectStatus(response, options.expected, `${method.toUpperCase()} ${path}`)
    return response
  }

  get(path: string, options?: RequestOptions) {
    return this.send('get', path, options)
  }
  post(path: string, options?: RequestOptions) {
    return this.send('post', path, options)
  }
  patch(path: string, options?: RequestOptions) {
    return this.send('patch', path, options)
  }
  delete(path: string, options?: RequestOptions) {
    return this.send('delete', path, options)
  }
}

export async function login(request: APIRequestContext, credentials: Credentials): Promise<Session> {
  const response = await request.post('/auth/login', { data: credentials })
  await expectStatus(response, 201, 'Login')
  const tokens = await json<{ accessToken: string; refreshToken: string }>(response)
  expect(tokens.accessToken).toEqual(expect.any(String))
  expect(tokens.refreshToken).toEqual(expect.any(String))
  const client = new ApiClient(request, tokens.accessToken)
  const profileResponse = await client.get('/auth/profile', { expected: 200 })
  return { ...tokens, profile: await json(profileResponse) }
}
