import { useEffect, useState } from 'react'
import { locationsApi, type ProvinceOption, type WardOption } from '@/shared/api/locations'

interface AdministrativeAreaSelectProps {
  provinceCode: string
  wardCode: string
  onChange: (value: { provinceCode: string; wardCode: string }) => void
  compact?: boolean
}

export function AdministrativeAreaSelect({ provinceCode, wardCode, onChange, compact }: AdministrativeAreaSelectProps) {
  const [provinces, setProvinces] = useState<ProvinceOption[]>([])
  const [wards, setWards] = useState<WardOption[]>([])

  useEffect(() => {
    const controller = new AbortController()
    void locationsApi.listProvinces(controller.signal).then(setProvinces).catch(() => undefined)
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!provinceCode) return
    const controller = new AbortController()
    void locationsApi.listWards(provinceCode, controller.signal).then(setWards).catch(() => undefined)
    return () => controller.abort()
  }, [provinceCode])

  const className = compact
    ? 'h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm outline-none focus:border-primary'
    : 'h-10 w-full rounded-lg border border-surface-border bg-surface-container-lowest px-3 font-body-md outline-none focus:border-primary'

  return (
    <div className={compact ? 'grid w-full grid-cols-1 gap-2 sm:grid-cols-2' : 'space-y-3'}>
      <select aria-label="Tỉnh / Thành phố" className={className} value={provinceCode}
        onChange={(event) => onChange({ provinceCode: event.target.value, wardCode: '' })}>
        <option value="">Tất cả tỉnh/thành</option>
        {provinces.map((province) => <option key={province.code} value={province.code}>{province.type} {province.name}</option>)}
      </select>
      <select aria-label="Xã / Phường" className={className} value={wardCode} disabled={!provinceCode}
        onChange={(event) => onChange({ provinceCode, wardCode: event.target.value })}>
        <option value="">Tất cả xã/phường</option>
        {wards.map((ward) => <option key={ward.code} value={ward.code}>{ward.type} {ward.name}</option>)}
      </select>
    </div>
  )
}
