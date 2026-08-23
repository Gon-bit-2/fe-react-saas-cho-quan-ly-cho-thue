import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AddressPicker } from './address-picker'

const api = vi.hoisted(() => ({
  listProvinces: vi.fn(),
  listWards: vi.fn(),
  autocomplete: vi.fn(),
  placeDetail: vi.fn(),
  reverseGeocode: vi.fn(),
}))

vi.mock('@/shared/api/locations', () => ({ locationsApi: api }))
vi.mock('./goong-map', () => ({ GoongMap: () => <div data-testid="goong-map" /> }))

const initial = {
  provinceCode: '01',
  province: 'Thành phố Hà Nội',
  wardCode: '00004',
  ward: 'Phường Ba Đình',
  addressDetail: '',
}

describe('AddressPicker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    api.listProvinces.mockResolvedValue([{ code: '01', name: 'Hà Nội', type: 'Thành phố' }])
    api.listWards.mockResolvedValue([{ code: '00004', name: 'Ba Đình', type: 'Phường', provinceCode: '01' }])
    api.autocomplete.mockReset()
    api.placeDetail.mockReset()
    api.reverseGeocode.mockReset()
  })

  it('debounces autocomplete for 350 ms', async () => {
    api.autocomplete.mockResolvedValue([])
    render(<AddressPicker initial={initial} onChange={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Số nhà, tên đường'), { target: { value: '1 Trần Phú' } })
    await act(async () => vi.advanceTimersByTime(349))
    expect(api.autocomplete).not.toHaveBeenCalled()

    await act(async () => vi.advanceTimersByTime(1))
    expect(api.autocomplete).toHaveBeenCalledTimes(1)
    expect(api.autocomplete).toHaveBeenCalledWith(
      expect.objectContaining({ input: '1 Trần Phú', provinceCode: '01', wardCode: '00004' }),
      expect.any(AbortSignal),
    )
  })

  it('cancels the previous request and ignores its stale response', async () => {
    let resolveFirst!: (value: Array<{ placeId: string; description: string }>) => void
    let resolveSecond!: (value: Array<{ placeId: string; description: string }>) => void
    const first = new Promise<Array<{ placeId: string; description: string }>>(resolve => { resolveFirst = resolve })
    const second = new Promise<Array<{ placeId: string; description: string }>>(resolve => { resolveSecond = resolve })
    api.autocomplete.mockReturnValueOnce(first).mockReturnValueOnce(second)

    render(<AddressPicker initial={initial} onChange={vi.fn()} />)
    const input = screen.getByLabelText('Số nhà, tên đường')

    fireEvent.change(input, { target: { value: 'Trần Phú' } })
    await act(async () => vi.advanceTimersByTime(350))
    const firstSignal = api.autocomplete.mock.calls[0][1] as AbortSignal

    fireEvent.change(input, { target: { value: 'Phan Đình Phùng' } })
    expect(firstSignal.aborted).toBe(true)
    await act(async () => vi.advanceTimersByTime(350))

    await act(async () => resolveSecond([{ placeId: 'new', description: '11 Phan Đình Phùng, Ba Đình' }]))
    expect(screen.getByText('11 Phan Đình Phùng, Ba Đình')).toBeInTheDocument()

    await act(async () => resolveFirst([{ placeId: 'old', description: '1 Trần Phú, Ba Đình' }]))
    expect(screen.queryByText('1 Trần Phú, Ba Đình')).not.toBeInTheDocument()
    expect(screen.getByText('11 Phan Đình Phùng, Ba Đình')).toBeInTheDocument()
  })

  it('requires legacy addresses to be selected again', async () => {
    render(
      <AddressPicker
        initial={{ province: 'Hà Nội', ward: 'Ba Đình', addressDetail: 'Địa chỉ cũ' }}
        onChange={vi.fn()}
      />,
    )
    await act(async () => undefined)
    expect(screen.getByText(/Đây là địa chỉ cũ/)).toBeInTheDocument()
  })
})
