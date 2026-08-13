import { describe, expect, it } from 'vitest'
import { normalizeMarketplaceRoom } from './marketplace'

describe('normalizeMarketplaceRoom', () => {
  it('normalizes the public room payload returned by the backend', () => {
    const room = normalizeMarketplaceRoom({
      id: 1,
      title: 'Bright studio near university',
      roomCode: 'MVP-A101',
      basePrice: '5500000',
      depositAmount: '5500000',
      electricityPrice: '3500',
      waterPrice: '20000',
      area: '25',
      maxOccupants: 2,
      status: 'AVAILABLE',
      marketplaceStatus: 'PUBLISHED',
      property: {
        id: 1,
        name: 'MVP Demo Building',
        type: 'MINI_APARTMENT',
        province: 'Ho Chi Minh City',
        district: 'Thu Duc City',
        ward: 'Linh Trung',
      },
      images: [],
      amenities: [
        {
          amenity: {
            id: 2,
            name: 'Ban công',
            icon: 'balcony',
          },
        },
      ],
    })

    expect(room.basePrice).toBe(5_500_000)
    expect(room.depositAmount).toBe(5_500_000)
    expect(room.area).toBe(25)
    expect(room.property.type.replaceAll('_', ' ')).toBe('MINI APARTMENT')
    expect(room.amenities).toEqual([{ id: 2, name: 'Ban công', icon: 'balcony' }])
  })
})
