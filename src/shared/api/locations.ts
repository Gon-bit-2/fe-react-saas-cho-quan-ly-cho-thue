import { apiClient } from './axios-client'

export interface ProvinceOption {
  code: string
  name: string
  type: 'Tỉnh' | 'Thành phố'
}

export interface WardOption {
  code: string
  name: string
  type: 'Phường' | 'Xã' | 'Đặc khu'
  provinceCode: string
}

export interface PlacePrediction {
  placeId: string
  description: string
  mainText?: string
  secondaryText?: string
}

export interface PlaceDetail {
  placeId: string | null
  formattedAddress: string
  name: string | null
  latitude: number
  longitude: number
}

export const locationsApi = {
  listProvinces: async (signal?: AbortSignal) => {
    const { data } = await apiClient.get<ProvinceOption[]>('/locations/provinces', { signal })
    return data
  },
  listWards: async (provinceCode: string, signal?: AbortSignal) => {
    const { data } = await apiClient.get<WardOption[]>('/locations/wards', {
      params: { provinceCode },
      signal,
    })
    return data
  },
  autocomplete: async (
    params: { input: string; sessionToken: string; provinceCode: string; wardCode: string },
    signal?: AbortSignal,
  ) => {
    const { data } = await apiClient.get<PlacePrediction[]>('/locations/autocomplete', { params, signal })
    return data
  },
  placeDetail: async (
    params: { placeId: string; sessionToken: string; provinceCode: string; wardCode: string },
    signal?: AbortSignal,
  ) => {
    const { data } = await apiClient.get<PlaceDetail>('/locations/place-detail', { params, signal })
    return data
  },
  reverseGeocode: async (latitude: number, longitude: number, signal?: AbortSignal) => {
    const { data } = await apiClient.get<PlaceDetail>('/locations/reverse-geocode', {
      params: { latitude, longitude },
      signal,
    })
    return data
  },
}
