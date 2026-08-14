import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, MapPin, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { locationsApi, type PlacePrediction, type ProvinceOption, type WardOption } from '@/shared/api/locations'
import { GoongMap } from './goong-map'

export interface AddressSelection {
  provinceCode: string
  wardCode: string
  placeId: string
  sessionToken: string
  addressDetail: string
  latitude: number
  longitude: number
}

interface AddressPickerProps {
  initial?: {
    provinceCode?: string | null
    province?: string
    wardCode?: string | null
    ward?: string
    addressDetail?: string
    latitude?: number | null
    longitude?: number | null
  }
  onChange: (selection: AddressSelection | null) => void
}

export function AddressPicker({ initial, onChange }: AddressPickerProps) {
  const [provinces, setProvinces] = useState<ProvinceOption[]>([])
  const [wards, setWards] = useState<WardOption[]>([])
  const [provinceCode, setProvinceCode] = useState(initial?.provinceCode ?? '')
  const [wardCode, setWardCode] = useState(initial?.wardCode ?? '')
  const [input, setInput] = useState(initial?.addressDetail ?? '')
  const [predictions, setPredictions] = useState<PlacePrediction[]>([])
  const [selection, setSelection] = useState<AddressSelection | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const sessionToken = useMemo(() => crypto.randomUUID(), [])
  const sequence = useRef(0)

  useEffect(() => {
    const controller = new AbortController()
    void locationsApi.listProvinces(controller.signal)
      .then(setProvinces)
      .catch((reason: unknown) => {
        if ((reason as { code?: string }).code !== 'ERR_CANCELED') setError('Không tải được danh mục tỉnh/thành.')
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!provinceCode) return
    const controller = new AbortController()
    void locationsApi.listWards(provinceCode, controller.signal)
      .then(setWards)
      .catch((reason: unknown) => {
        if ((reason as { code?: string }).code !== 'ERR_CANCELED') setError('Không tải được danh mục xã/phường.')
      })
    return () => controller.abort()
  }, [provinceCode])

  useEffect(() => {
    if (input.trim().length < 2 || !provinceCode || !wardCode || selection?.addressDetail === input) return
    const requestId = ++sequence.current
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setLoading(true)
      setError('')
      void locationsApi.autocomplete(
        { input: input.trim(), sessionToken, provinceCode, wardCode },
        controller.signal,
      )
        .then((items) => {
          if (requestId === sequence.current) setPredictions(items)
        })
        .catch((reason: unknown) => {
          if ((reason as { code?: string }).code !== 'ERR_CANCELED' && requestId === sequence.current) {
            setError('Không thể tìm địa chỉ. Vui lòng thử lại.')
          }
        })
        .finally(() => {
          if (requestId === sequence.current) setLoading(false)
        })
    }, 350)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [input, provinceCode, selection?.addressDetail, sessionToken, wardCode])

  const choosePrediction = async (prediction: PlacePrediction) => {
    setLoading(true)
    setError('')
    setPredictions([])
    try {
      const detail = await locationsApi.placeDetail({
        placeId: prediction.placeId,
        sessionToken,
        provinceCode,
        wardCode,
      })
      const next: AddressSelection = {
        provinceCode,
        wardCode,
        placeId: prediction.placeId,
        sessionToken,
        addressDetail: detail.formattedAddress,
        latitude: detail.latitude,
        longitude: detail.longitude,
      }
      setInput(detail.formattedAddress)
      setSelection(next)
      onChange(next)
    } catch {
      setError('Địa điểm không khớp tỉnh/thành và xã/phường đã chọn.')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkerChange = async (position: { latitude: number; longitude: number }) => {
    setLoading(true)
    try {
      const detail = await locationsApi.reverseGeocode(position.latitude, position.longitude)
      if (!detail.placeId) throw new Error('Missing place id')
      const next: AddressSelection = {
        provinceCode,
        wardCode,
        placeId: detail.placeId,
        sessionToken,
        addressDetail: detail.formattedAddress,
        latitude: detail.latitude,
        longitude: detail.longitude,
      }
      setInput(detail.formattedAddress)
      setSelection(next)
      onChange(next)
    } catch {
      setError('Không xác định được địa chỉ tại vị trí marker.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {initial?.province && !initial.provinceCode && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Đây là địa chỉ cũ. Vui lòng chọn lại tỉnh/thành, xã/phường và địa điểm chuẩn trước khi lưu.
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Tỉnh/Thành phố</Label>
          <Select
            value={provinceCode}
            onValueChange={(value) => {
              setProvinceCode(value)
              setWardCode('')
              setWards([])
              setPredictions([])
              setSelection(null)
              onChange(null)
            }}
          >
            <SelectTrigger><SelectValue placeholder="Chọn tỉnh/thành" /></SelectTrigger>
            <SelectContent>
              {provinces.map((province) => (
                <SelectItem key={province.code} value={province.code}>{province.type} {province.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Xã/Phường/Đặc khu</Label>
          <Select
            value={wardCode}
            onValueChange={(value) => {
              setWardCode(value)
              setPredictions([])
              setSelection(null)
              onChange(null)
            }}
            disabled={!provinceCode}
          >
            <SelectTrigger><SelectValue placeholder="Chọn xã/phường" /></SelectTrigger>
            <SelectContent>
              {wards.map((ward) => (
                <SelectItem key={ward.code} value={ward.code}>{ward.type} {ward.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="relative space-y-2">
        <Label htmlFor="address-search">Số nhà, tên đường</Label>
        <div className="relative">
          <Search className="text-on-surface-variant absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            id="address-search"
            value={input}
            onChange={(event) => {
              setInput(event.target.value)
              setPredictions([])
              setSelection(null)
              onChange(null)
            }}
            disabled={!wardCode}
            placeholder="Nhập số nhà hoặc tên đường để tìm"
            autoComplete="off"
            className="pl-9 pr-9"
          />
          {loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />}
        </div>
        {predictions.length > 0 && (
          <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border bg-white p-1 shadow-xl" role="listbox">
            {predictions.map((prediction) => (
              <li key={prediction.placeId}>
                <button
                  type="button"
                  className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left hover:bg-slate-50 focus:bg-slate-50"
                  onClick={() => void choosePrediction(prediction)}
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <span className="text-sm">{prediction.description}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {selection && (
        <GoongMap
          latitude={selection.latitude}
          longitude={selection.longitude}
          draggable
          onPositionChange={(position) => void handleMarkerChange(position)}
        />
      )}
    </div>
  )
}
