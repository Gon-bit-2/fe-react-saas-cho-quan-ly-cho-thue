import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const readSource = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf8')

const routerSource = readSource('./routes.tsx')
const navigationSource = [
  readSource('../layouts/tenant-layout.tsx'),
  readSource('../pages/session-expired.tsx'),
  readSource('../guards/require-permission.tsx'),
  readSource('../guards/require-renter.tsx'),
  readSource('../guards/require-system-role.tsx'),
  readSource('../guards/require-tenant-role.tsx'),
  readSource('../../features/marketplace/components/marketplace-header.tsx'),
  readSource('../../features/marketplace/components/marketplace-footer.tsx'),
  readSource('../../features/marketplace/components/room-card.tsx'),
  readSource('../../features/marketplace/pages/home.tsx'),
  readSource('../../features/tenant-app/pages/properties/property-detail.tsx'),
  readSource('../../features/tenant-app/pages/rooms/room-detail.tsx'),
  readSource('../../features/saas/pages/listings-moderation/moderation-detail.tsx'),
  readSource('../../features/saas/pages/listings-moderation/moderation-history.tsx'),
  readSource('../../features/saas/pages/listings-moderation/moderation-queue.tsx'),
].join('\n')

const canonicalRouteDefinitions = [
  "path: 'phong'",
  "path: 'phong/:roomId'",
  "path: '/dang-nhap'",
  "path: '/loi-truy-cap'",
  "path: '/phien-het-han'",
  "path: 'hop-dong'",
  "path: 'thong-bao'",
  "path: 'goi-dich-vu'",
  "path: 'quan-ly-phong/:id/chinh-sua'",
  "path: 'kiem-duyet/hang-cho'",
  "path: 'kiem-duyet/chi-tiet/:id'",
]

const retiredNavigationPaths = [
  '/rooms',
  '/app/contracts',
  '/app/notifications',
  '/app/packages',
  '/auth/login',
  '/403',
  '/admin/kiem-duyet-tin-phong',
  '/app/rooms',
]

describe('canonical navigation routes', () => {
  it.each(canonicalRouteDefinitions)('registers %s', (routeDefinition) => {
    expect(routerSource).toContain(routeDefinition)
  })

  it.each(retiredNavigationPaths)('does not use retired path %s', (retiredPath) => {
    expect(navigationSource).not.toContain(retiredPath)
  })
})
