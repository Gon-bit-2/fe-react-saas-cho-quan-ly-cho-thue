import z from 'zod'

/**
 * Schema validation cho biến môi trường Vite.
 * - VITE_API_URL: URL API backend, bỏ dấu `/` cuối
 * - VITE_APP_NAME: Tên ứng dụng hiển thị
 * - VITE_API_TIMEOUT_MS: Timeout API mặc định (ms), default 15000
 */
const envSchema = z.object({
  VITE_API_URL: z
    .string()
    .url('VITE_API_URL phải là URL hợp lệ')
    .transform((url) => url.replace(/\/+$/, '')),
  VITE_APP_NAME: z.string().min(1, 'VITE_APP_NAME không được để trống'),
  VITE_API_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
  VITE_GOONG_MAPTILES_KEY: z.string().trim().optional(),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  // Chỉ log tên field lỗi, không log giá trị thực tế để tránh rò rỉ secret
  const fieldErrors = parsed.error.flatten().fieldErrors
  const failedFields = Object.keys(fieldErrors).join(', ')
  console.error(`[env] Cấu hình không hợp lệ: ${failedFields}`)

  throw new Error(
    `Environment configuration is invalid. Check: ${failedFields}`,
  )
}

/** Cấu hình environment đã validate */
export type EnvConfig = {
  readonly apiUrl: string
  readonly appName: string
  readonly apiTimeoutMs: number
  readonly goongMaptilesKey?: string
}

/**
 * Cấu hình environment đã qua Zod validation.
 * Fail-fast tại import time nếu thiếu/sai biến.
 */
export const env: EnvConfig = {
  apiUrl: parsed.data.VITE_API_URL,
  appName: parsed.data.VITE_APP_NAME,
  apiTimeoutMs: parsed.data.VITE_API_TIMEOUT_MS,
  goongMaptilesKey: parsed.data.VITE_GOONG_MAPTILES_KEY,
} as const
