

export type TListingModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN'

export interface IListingModerationDTO {
  id: string
  roomName: string
  tenantName: string
  submittedAt: string
  status: TListingModerationStatus
  image?: string
}

export interface IListingsModerationQueryDTO {
  page?: number
  limit?: number
  status?: TListingModerationStatus
  search?: string
}

export const listingsModerationApi = {
  list: async () => {
    // Return mock data for UI implementation until real API is ready
    return {
      data: [
        {
          id: '1',
          roomName: 'Phòng Studio Cao Cấp - Vinhomes',
          tenantName: 'Green City Estates',
          submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'PENDING',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBhgZNW-dgP-Z1ROpxM8W8wRrbBPcorKYNDrS-0_hFx2dZMNKhWxUinOxAeRbj4l4PhD-NDOmg4vTkzEMiNxrlc9pHBbXX387Itm3TD3fsgLr9bTdDTSGl6IJwJTWYtQcOrD1OKf9sA-Yoth_niHxREaYipUE07crzEyqZp6bsenVXjKdSQiVl--ebIyywFGs7MxscTcZ4IY4P69FDkK6B3lyxrHKm9mWALZmTDIRqIE4I1oaKJwFZ'
        },
        {
          id: '2',
          roomName: 'Ký túc xá Tiện nghi - Quận 7',
          tenantName: 'Urban Living Co.',
          submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          status: 'PENDING',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyUTVtySPTvthE69l8OJRHoII-99b4_sNUDUxRl7upjkXxvt-wGM5ch-hRmOQyyCIV9ofquZ8b8mri4C_KdUdLLtNsQWWNw3C7FsNFmtavChJgNfP739jjbC42AOWJJWfJt-K5ibi5WuoOUXSKSBz1COb3HEqpOmKsiE6_z_09EjcRjA5_M0qFXbtjRyR7mn1sE6KWHXi91HXFHfGDVodoGbJdlCw4LNQNFDwdfOw9Wn1ZCi3wfMWa'
        },
        {
          id: '3',
          roomName: 'Căn hộ Mini Giá Rẻ - Tân Bình',
          tenantName: 'An Gia Thọ',
          submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'HIDDEN',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAYiQQy25SFZvggJewvaktvPzOIDCimBtZyQ2Lvb1aSV6aWT1GA9g5Xr6YKHF369rR9dcOpfgkxHcFDemLbcdZpf2xJeaMGehwyiMU60WdKI4FURPPA4lIeuMO_Yek5pWRhlFqTQfon-or91Ic4sWoda_dZz7MCtMHClutNHHrq74eoqjHMs-HEp1fuP5oIYXeKOjlC8Hxiyz7lp9KfkOZQGw9jqZPOisI8xbKQDWWQGo3DKiQk7MG'
        }
      ] as IListingModerationDTO[],
      total: 3
    }
  },
  getById: async (id: string) => {
    return {
      id,
      roomName: 'Phòng ban công thoáng mát, full nội thất, giờ giấc tự do quận Tân Bình',
      tenantName: 'Nguyễn Văn A',
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'PENDING' as TListingModerationStatus,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTvMuXTJuDtBBn09sqLlurIvLjn0cicCDl-05pljsyKXeYmijvZPxED2mZMnNiFzDt6ic1Dn9sXz_RMMn9fbO2rBWPvMLhQiKR72W8Wy4ZZ9NEUNU2OsVNan5sSHlY0Qh8aGhU41w-3UujAjKuqI9fNSDvRZD83vLE91PIhg2kVmjIf0fd2dsey3bmMUKebpBY-KasBYykn7wIAkOcSH8yjPCOUBbvIvAppsVZKOwse6i8xllzhqPx',
      price: 4500000,
      area: 25,
      address: '123 Đường Cộng Hòa, Phường 12, Quận Tân Bình, TP. HCM',
      description: '- Phòng trọ sạch sẽ, thoáng mát, có ban công rộng rãi phơi đồ thoải mái.\n- Nội thất đầy đủ: Máy lạnh, tủ lạnh, máy giặt dùng chung, giường nệm, tủ quần áo, bàn ghế làm việc.\n- Giờ giấc tự do, không chung chủ. Khóa vân tay an ninh 2 lớp, camera 24/7.\n- Điện: 3.5k/kwh, Nước: 100k/người, Dịch vụ (wifi, rác, vệ sinh hành lang): 150k/phòng.\n- Gần các trường ĐH, siêu thị, chợ. Giao thông thuận tiện.',
      amenities: ['Máy lạnh', 'Tủ lạnh', 'Máy giặt', 'Wifi miễn phí', 'Chỗ để xe', 'Camera an ninh']
    }
  },
  getHistory: async () => {
    return [
      {
        id: 'h1',
        action: 'REJECTED',
        fromStatus: 'PENDING',
        toStatus: 'REJECTED',
        note: 'Hình ảnh không rõ nét, thiếu hình ảnh mặt tiền và phòng tắm. Yêu cầu chụp lại theo hướng dẫn chất lượng của nền tảng.',
        actorId: 'admin1',
        actorName: 'System Admin',
        actorRole: 'Admin',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'h2',
        action: 'UPDATED',
        fromStatus: 'REJECTED',
        toStatus: 'PENDING',
        note: 'Đã bổ sung 4 hình ảnh mới và cập nhật lại mô tả chi tiết.',
        actorId: 'tenant1',
        actorName: 'Hoàng Thành (Chủ trọ)',
        actorRole: 'Tenant',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'h3',
        action: 'APPROVED',
        fromStatus: 'PENDING',
        toStatus: 'APPROVED',
        note: '',
        actorId: 'admin1',
        actorName: 'System Admin',
        actorRole: 'Admin',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  updateStatus: async () => {
    return { success: true }
  }
}
