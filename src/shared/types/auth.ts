/**
 * Types cho session và auth, dùng nội bộ bởi session store và auth provider.
 * Orval sẽ sinh types API riêng — file này chỉ chứa types cho tầng session/guard.
 * @see G01_xac_thuc_tai_khoan_phan_quyen.md
 */

// ─── System Roles ───────────────────────────────────────────────

/** Vai trò cấp hệ thống, lưu trong User.systemRole */
export const SystemRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const
export type SystemRole = (typeof SystemRole)[keyof typeof SystemRole]

// ─── Tenant Roles ───────────────────────────────────────────────

/** Vai trò trong ngữ cảnh tenant, lưu trong TenantMember.role.name */
export const TenantRole = {
  LANDLORD: 'LANDLORD',
  MANAGER: 'MANAGER',
  ACCOUNTANT: 'ACCOUNTANT',
  MAINTENANCE_STAFF: 'MAINTENANCE_STAFF',
} as const
export type TenantRole = (typeof TenantRole)[keyof typeof TenantRole]

// ─── Status Enums ───────────────────────────────────────────────

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BANNED: 'BANNED',
} as const
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]

export const TenantStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  CLOSED: 'CLOSED',
} as const
export type TenantStatus = (typeof TenantStatus)[keyof typeof TenantStatus]

export const MemberStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const
export type MemberStatus = (typeof MemberStatus)[keyof typeof MemberStatus]

// ─── Profile Response Shape ─────────────────────────────────────

/** Permission gắn vào role trong tenant */
export interface TenantPermission {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly module: string
  readonly description: string | null
}

/** Role của member trong tenant, kèm danh sách permissions */
export interface TenantMemberRole {
  readonly id: string
  readonly name: string
  readonly description: string | null
  readonly permissions: ReadonlyArray<{
    readonly permission: TenantPermission
  }>
}

/** Thông tin tenant cơ bản */
export interface TenantInfo {
  readonly id: number
  readonly name: string
  readonly slug: string
  readonly status: TenantStatus
  readonly ownerUserId: number
}

/** Membership của user trong một tenant, bao gồm role và permissions */
export interface TenantMembership {
  readonly id: number
  readonly tenantId: number
  readonly roleId: string
  readonly status: MemberStatus
  readonly joinedAt: string
  readonly tenant: TenantInfo
  readonly role: TenantMemberRole
}

/** Renter profile nếu user là người thuê */
export interface RenterProfile {
  readonly id: number
  readonly verificationStatus: string
}

/**
 * Profile user trả về từ GET /auth/profile.
 * Khớp với authUserSelect trong backend.
 */
export interface UserProfile {
  readonly id: number
  readonly email: string
  readonly fullName: string
  readonly phone: string | null
  readonly systemRole: SystemRole
  readonly avatarUrl: string | null
  readonly status: UserStatus
  readonly emailVerifiedAt: string | null
  readonly phoneVerifiedAt: string | null
  readonly lastLoginAt: string | null
  readonly createdAt: string
  readonly updatedAt: string
  readonly deletedAt: string | null
  readonly tenantMembers: readonly TenantMembership[]
  readonly renterProfile: RenterProfile | null
}

// ─── Session State Machine ──────────────────────────────────────

/**
 * Trạng thái session:
 * - bootstrapping: đang kiểm tra refresh token / gọi profile
 * - anonymous: chưa đăng nhập hoặc token hết hạn
 * - authenticated: đã xác thực thành công
 * - expired: session hết hạn, cần đăng nhập lại
 */
export type SessionState =
  | 'bootstrapping'
  | 'anonymous'
  | 'authenticated'
  | 'expired'

// ─── Token Pair ─────────────────────────────────────────────────

/** Cặp token trả về từ login/refresh/google session */
export interface TokenPair {
  readonly accessToken: string
  readonly refreshToken: string
}

// ─── Session Context Value ──────────────────────────────────────

/**
 * Interface công khai của auth context.
 * Không chứa raw token — chỉ có trạng thái, profile và các action.
 */
export interface SessionContextValue {
  readonly state: SessionState
  readonly profile: UserProfile | null
  readonly selectedMembership: TenantMembership | null

  /** Thiết lập session sau khi login/google thành công */
  establishSession: (tokenPair: TokenPair, profile: UserProfile) => void
  /** Đăng xuất: gọi API, xóa session, clear query cache */
  logout: () => Promise<void>
  /** Chọn tenant: validate ACTIVE, cancel requests, clear cache */
  selectTenant: (tenantId: number) => void
  /** Kiểm tra system role (ADMIN, USER) */
  hasSystemRole: (role: SystemRole) => boolean
  /** Kiểm tra tenant role trong selected membership */
  hasTenantRole: (role: TenantRole) => boolean
  /** Kiểm tra permission code trong selected membership */
  hasPermission: (code: string) => boolean
}
