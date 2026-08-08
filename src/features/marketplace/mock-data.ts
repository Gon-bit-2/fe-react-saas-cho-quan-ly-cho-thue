import type { MarketplaceRoom } from './types'

export const MOCK_ROOMS: MarketplaceRoom[] = [
  {
    id: 1,
    title: 'Căn hộ Studio cao cấp gần trung tâm',
    roomCode: 'RM-001',
    basePrice: 5500000,
    deposit: 5500000,
    electricityPrice: 3800,
    waterPrice: 100000,
    area: 35,
    maxOccupants: 2,
    status: 'AVAILABLE',
    marketplaceStatus: 'PUBLISHED',
    property: {
      id: 101,
      name: 'Blue Sky Apartments',
      address: '123 Đường Nguyễn Văn Linh',
      province: 'Hà Nội',
      district: 'Cầu Giấy',
      ward: 'Trung Hòa',
      propertyType: 'MINI_APARTMENT',
      latitude: 21.0123,
      longitude: 105.8012
    },
    images: [
      {
        id: 1001,
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
        isThumbnail: true,
        sortOrder: 1
      },
      {
        id: 1002,
        url: 'https://images.unsplash.com/photo-1502672260266-1c152939298f?w=800&q=80',
        isThumbnail: false,
        sortOrder: 2
      }
    ],
    amenities: [
      { id: 1, name: 'Điều hòa', icon: 'ac_unit' },
      { id: 2, name: 'Nóng lạnh', icon: 'water_heater' },
      { id: 3, name: 'Giường tủ', icon: 'bed' }
    ]
  },
  {
    id: 2,
    title: 'Phòng trọ khép kín full đồ mới xây',
    roomCode: 'RM-002',
    basePrice: 3200000,
    deposit: 3200000,
    electricityPrice: 3500,
    waterPrice: 20000,
    area: 20,
    maxOccupants: 1,
    status: 'AVAILABLE',
    marketplaceStatus: 'PUBLISHED',
    property: {
      id: 102,
      name: 'Nhà trọ Hoa Hướng Dương',
      address: '45 Ngõ 102 Khuất Duy Tiến',
      province: 'Hà Nội',
      district: 'Thanh Xuân',
      ward: 'Nhân Chính',
      propertyType: 'HOUSE',
      latitude: 21.0011,
      longitude: 105.7955
    },
    images: [
      {
        id: 2001,
        url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80',
        isThumbnail: true,
        sortOrder: 1
      }
    ],
    amenities: [
      { id: 1, name: 'Điều hòa', icon: 'ac_unit' },
      { id: 4, name: 'Máy giặt chung', icon: 'local_laundry_service' }
    ]
  },
  {
    id: 3,
    title: 'Căn góc 2N1K siêu thoáng view thành phố',
    roomCode: 'RM-003',
    basePrice: 8500000,
    deposit: 8500000,
    electricityPrice: 4000,
    waterPrice: 120000,
    area: 55,
    maxOccupants: 4,
    status: 'AVAILABLE',
    marketplaceStatus: 'PUBLISHED',
    property: {
      id: 103,
      name: 'Sunrise Complex',
      address: '88 Đường Láng',
      province: 'Hà Nội',
      district: 'Đống Đa',
      ward: 'Ngã Tư Sở',
      propertyType: 'APARTMENT',
      latitude: 21.0055,
      longitude: 105.8122
    },
    images: [
      {
        id: 3001,
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
        isThumbnail: true,
        sortOrder: 1
      }
    ],
    amenities: [
      { id: 1, name: 'Điều hòa', icon: 'ac_unit' },
      { id: 2, name: 'Nóng lạnh', icon: 'water_heater' },
      { id: 3, name: 'Giường tủ', icon: 'bed' },
      { id: 5, name: 'Ban công', icon: 'balcony' }
    ]
  }
]
