import type { UserProfile } from '@/shared/types/auth'

export function getPostLoginPath(profile: UserProfile): string {
  if (profile.systemRole === 'ADMIN') return '/admin'

  const activeMemberships = profile.tenantMembers.filter(
    (membership) => membership.status === 'ACTIVE' && membership.tenant.status === 'ACTIVE',
  )

  if (activeMemberships.length === 1) return '/tong-quan'
  if (activeMemberships.length > 1) return '/tai-khoan/chon-nha-tro'

  return '/'
}
