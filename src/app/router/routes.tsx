import { createBrowserRouter } from 'react-router'
import { RequireGuest } from '@/app/guards/require-guest'
import { RequireAuth } from '@/app/guards/require-auth'
import { RequireSystemRole } from '@/app/guards/require-system-role'
import { RequireTenantContext } from '@/app/guards/require-tenant-context'
import { GoogleCallbackPage } from '@/app/router/google-callback'
import { NotFoundPage } from '@/app/pages/not-found'
import { ForbiddenPage } from '@/app/pages/forbidden'
import { SessionExpiredPage } from '@/app/pages/session-expired'

/**
 * Router chính — tạo MỘT lần ngoài React tree.
 *
 * Cấu trúc route groups:
 * - Public: `/`, marketplace
 * - Guest auth: `/login`, `/login/otp`, `/register`, `/forgot-password`
 * - Google callback: `/auth/google/callback`
 * - Authenticated: `/account/*`
 * - Tenant operations: `/app/*` (RequireAuth + RequireTenantContext)
 * - Platform admin: `/admin/*` (RequireAuth + RequireSystemRole ADMIN)
 * - Error pages: `/403`, `/session-expired`
 * - Wildcard: `*` → 404
 *
 * @see https://api.reactrouter.com/v8/functions/react-router.createBrowserRouter.html
 */
export const router = createBrowserRouter([
  // ─── Public Routes ──────────────────────────────────────
  {
    path: '/',
    lazy: () => import('@/app/layouts/public-layout'),
    children: [
      {
        index: true,
        lazy: () => import('@/features/marketplace/pages/home'),
      },
      {
        path: 'rooms',
        lazy: () => import('@/features/marketplace/pages/room-list'),
      },
      {
        path: 'rooms/:roomId',
        lazy: () => import('@/features/marketplace/pages/room-detail'),
      },
    ],
  },

  // ─── Guest Auth Routes (chỉ khi chưa đăng nhập) ────────
  {
    element: <RequireGuest />,
    children: [
      {
        lazy: () => import('@/app/layouts/auth-layout'),
        children: [
          {
            path: '/login',
            lazy: () => import('@/features/auth/pages/login'),
          },
          {
            path: '/login/otp',
            lazy: () => import('@/features/auth/pages/login-otp'),
          },
          {
            path: '/register',
            lazy: () => import('@/features/auth/pages/register'),
          },
          {
            path: '/forgot-password',
            lazy: () => import('@/features/auth/pages/forgot-password'),
          },
          {
            path: '/reset-password',
            lazy: () => import('@/features/auth/pages/reset-password'),
          },
        ],
      },
    ],
  },

  // ─── Google OAuth Callback ──────────────────────────────
  {
    path: '/auth/google/callback',
    element: <GoogleCallbackPage />,
  },

  // ─── Authenticated Routes ───────────────────────────────
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/account',
        lazy: () => import('@/app/layouts/account-layout'),
        children: [
          {
            index: true,
            lazy: () => import('@/features/auth/pages/profile'),
          },
          {
            path: 'select-tenant',
            lazy: () => import('@/features/auth/pages/select-tenant'),
          },
        ],
      },
    ],
  },

  // ─── Tenant Operations (landlord/staff) ─────────────────
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequireTenantContext />,
        children: [
          {
            path: '/app',
            lazy: () => import('@/app/layouts/tenant-layout'),
            children: [
              {
                path: 'dashboard',
                lazy: () => import('@/features/tenant-app/pages/dashboard/dashboard'),
              },
              {
                path: 'action-center',
                lazy: () => import('@/features/tenant-app/pages/dashboard/action-center'),
              },
              {
                path: 'properties',
                lazy: () => import('@/features/tenant-app/pages/properties/property-list'),
              },
              {
                path: 'properties/new',
                lazy: () => import('@/features/tenant-app/pages/properties/property-form'),
              },
              {
                path: 'properties/:id',
                lazy: () => import('@/features/tenant-app/pages/properties/property-detail'),
              },
              {
                path: 'properties/:id/edit',
                lazy: () => import('@/features/tenant-app/pages/properties/property-form'),
              },
              {
                path: 'quan-ly-phong/danh-sach',
                lazy: () => import('@/features/tenant-app/pages/rooms/room-list'),
              },
              {
                path: 'quan-ly-phong/tao-moi',
                lazy: () => import('@/features/tenant-app/pages/rooms/room-form'),
              },
              {
                path: 'quan-ly-phong/:id/chi-tiet',
                lazy: () => import('@/features/tenant-app/pages/rooms/room-detail'),
              },
              {
                path: 'quan-ly-nha-tro/yeu-cau-thue',
                lazy: () => import('@/features/tenant-app/pages/rental-requests/request-list'),
              },
              {
                path: 'quan-ly-nha-tro/yeu-cau-thue/:id',
                lazy: () => import('@/features/tenant-app/pages/rental-requests/request-detail'),
              },
              {
                path: 'quan-ly-nha-tro/lich-xem-phong',
                lazy: () => import('@/features/tenant-app/pages/viewing-schedules/schedule-list'),
              },
              {
                path: 'quan-ly-nha-tro/lich-xem-phong/:id',
                lazy: () => import('@/features/tenant-app/pages/viewing-schedules/schedule-detail'),
              },
              {
                path: 'nguoi-thue',
                lazy: () => import('@/features/tenant-app/pages/renters/renter-list'),
              },
              {
                path: 'nguoi-thue/:id',
                lazy: () => import('@/features/tenant-app/pages/renters/renter-detail'),
              },
              {
                path: 'nguoi-thue/loi-moi/tao',
                lazy: () => import('@/features/tenant-app/pages/renters/invite-form'),
              },
              {
                path: 'nguoi-thue/loi-moi/:id',
                lazy: () => import('@/features/tenant-app/pages/renters/invite-detail'),
              },
              {
                path: 'hop-dong',
                lazy: () => import('@/features/tenant-app/pages/contracts/contract-list'),
              },
              {
                path: 'hop-dong/tao',
                lazy: () => import('@/features/tenant-app/pages/contracts/contract-form'),
              },
              {
                path: 'hop-dong/:id/sua',
                lazy: () => import('@/features/tenant-app/pages/contracts/contract-form'),
              },
              {
                path: 'hop-dong/:id',
                lazy: () => import('@/features/tenant-app/pages/contracts/contract-detail'),
              },
              {
                path: 'hop-dong/:id/thanh-vien',
                lazy: () => import('@/features/tenant-app/pages/contracts/contract-members'),
              },
              // Quản lý tài sản (W09)
              {
                path: 'quan-ly-tai-san',
                lazy: () => import('@/features/tenant-app/pages/assets/asset-list'),
              },
              {
                path: 'quan-ly-tai-san/phong/:roomId',
                lazy: () => import('@/features/tenant-app/pages/assets/room-assets'),
              },
              {
                path: 'ban-giao/:id',
                lazy: () => import('@/features/tenant-app/pages/handovers/handover-detail'),
              },
              {
                path: 'ban-giao/:id/tranh-chap',
                lazy: () => import('@/features/tenant-app/pages/handovers/handover-dispute'),
              },
              {
                path: 'yeu-cau-ket-thuc-hop-dong',
                lazy: () => import('@/features/tenant-app/pages/terminations/termination-list'),
              },
              // Quản lý dịch vụ (W11)
              {
                path: 'dich-vu',
                lazy: () => import('@/features/tenant-app/pages/services/service-list'),
              },
              {
                path: 'dich-vu/tao-moi',
                lazy: () => import('@/features/tenant-app/pages/services/service-create'),
              },
              {
                path: 'dich-vu/:id/chinh-sua',
                lazy: () => import('@/features/tenant-app/pages/services/service-edit'),
              },
              {
                path: 'dich-vu-da-gan',
                lazy: () => import('@/features/tenant-app/pages/service-assignments/assignment-list'),
              },
              {
                path: 'dich-vu-da-gan/tao-moi',
                lazy: () => import('@/features/tenant-app/pages/service-assignments/assignment-form'),
              },
            ],
          },
        ],
      },
    ],
  },

  // ─── Platform Admin ─────────────────────────────────────
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequireSystemRole roles={['ADMIN']} />,
        children: [
          {
            path: '/admin',
            lazy: () => import('@/app/layouts/admin-layout'),
            children: [
              {
                index: true,
                lazy: () => import('@/features/dashboard/pages/admin-dashboard'),
              },
              // Admin feature routes sẽ được thêm khi xây page
            ],
          },
        ],
      },
    ],
  },

  // ─── Error Pages ────────────────────────────────────────
  {
    path: '/403',
    element: <ForbiddenPage />,
  },
  {
    path: '/session-expired',
    element: <SessionExpiredPage />,
  },

  // ─── Wildcard 404 ───────────────────────────────────────
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
