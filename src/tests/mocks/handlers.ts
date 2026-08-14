import { http, HttpResponse } from 'msw'
import type { LoginRes } from '@/shared/api/auth'

// API BASE URL, adjust if needed (e.g. from env)
const API_URL = import.meta.env?.VITE_API_URL || '/api'

export const handlers = [
  // Authentication Handlers
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    if (body.email === 'test@example.com' && body.password) {
      return HttpResponse.json<LoginRes>({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      })
    }
    return HttpResponse.json(
      { statusCode: 401, message: 'Invalid credentials', code: 'UNAUTHORIZED', requestId: 'mock-req-id' },
      { status: 401 }
    )
  }),

  http.post(`${API_URL}/auth/send-otp`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    if (body.email === 'test@example.com') {
      return HttpResponse.json({ message: 'OTP sent' })
    }
    return HttpResponse.json(
      { statusCode: 404, message: 'User not found', code: 'NOT_FOUND', requestId: 'mock-req-id' },
      { status: 404 }
    )
  }),

  http.get(`${API_URL}/auth/profile`, () => {
    return HttpResponse.json({
      id: 1,
      email: 'test@example.com',
      fullName: 'Test User',
      systemRole: 'USER',
      tenantMembers: [
        {
          id: 1,
          tenantId: 100,
          status: 'ACTIVE',
          role: { id: 1, name: 'ADMIN', permissions: [] },
          tenant: { id: 100, name: 'Test Tenant', status: 'ACTIVE' }
        }
      ]
    })
  }),

  http.get(`${API_URL}/locations/provinces`, () => {
    return HttpResponse.json([
      { code: '01', name: 'Thành phố Hà Nội', type: 'Thành phố' },
      { code: '79', name: 'Thành phố Hồ Chí Minh', type: 'Thành phố' },
    ])
  }),

  // Marketplace Handlers
  http.get(`${API_URL}/marketplace/rooms`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          title: 'Mock Room 1',
          roomCode: 'R01',
          basePrice: 5000000,
          depositAmount: '5000000',
          electricityPrice: 3500,
          waterPrice: 100000,
          area: '30',
          maxOccupants: 2,
          property: { id: 1, name: 'Mock Property', province: 'Hà Nội', district: 'Cầu Giấy', ward: 'Dịch Vọng', type: 'APARTMENT' },
          images: [],
          amenities: [],
          status: 'AVAILABLE',
          marketplaceStatus: 'PUBLISHED'
        }
      ],
      meta: { total: 1, page: 1, limit: 10 }
    })
  }),
]
