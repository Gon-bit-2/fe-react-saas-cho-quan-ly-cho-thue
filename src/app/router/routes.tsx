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
                path: 'rooms',
                lazy: () => import('@/features/tenant-app/pages/rooms/room-list'),
              },
              {
                path: 'rooms/new',
                lazy: () => import('@/features/tenant-app/pages/rooms/room-form'),
              },
              {
                path: 'rooms/:id/edit',
                lazy: () => import('@/features/tenant-app/pages/rooms/room-form'),
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
