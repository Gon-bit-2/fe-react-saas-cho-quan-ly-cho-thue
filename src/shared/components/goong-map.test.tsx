import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/app/config/env.config', () => ({
  env: { goongMaptilesKey: undefined },
}))

import { GoongMap } from './goong-map'

describe('GoongMap', () => {
  it('keeps an address-safe fallback when the map key is unavailable', () => {
    render(<GoongMap latitude={21.03} longitude={105.84} />)
    expect(screen.getByTestId('goong-map')).toHaveTextContent('Bản đồ không khả dụng; địa chỉ vẫn được lưu.')
  })
})
