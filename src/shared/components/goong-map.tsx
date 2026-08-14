import { useEffect, useRef, useState } from 'react'
import { env } from '@/app/config/env.config'

interface GoongMapProps {
  latitude: number
  longitude: number
  draggable?: boolean
  className?: string
  onPositionChange?: (position: { latitude: number; longitude: number }) => void
}

export function GoongMap({
  latitude,
  longitude,
  draggable = false,
  className = 'h-56',
  onPositionChange,
}: GoongMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onPositionChangeRef = useRef(onPositionChange)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    onPositionChangeRef.current = onPositionChange
  }, [onPositionChange])

  useEffect(() => {
    if (!containerRef.current || !env.goongMaptilesKey) return
    const maptilesKey = env.goongMaptilesKey
    let disposed = false
    let cleanup = () => undefined

    void Promise.all([
      import('@goongmaps/goong-js'),
      import('@goongmaps/goong-js/dist/goong-js.css'),
    ])
      .then(([module]) => {
        if (disposed || !containerRef.current) return
        const goongjs = module.default
        goongjs.accessToken = maptilesKey
        const map = new goongjs.Map({
          container: containerRef.current,
          style: 'https://tiles.goong.io/assets/goong_map_web.json',
          center: [longitude, latitude],
          zoom: 16,
          attributionControl: true,
        })
        const marker = new goongjs.Marker({ draggable, color: '#2563eb' })
          .setLngLat([longitude, latitude])
          .addTo(map)
        if (draggable) {
          marker.on('dragend', () => {
            const position = marker.getLngLat()
            onPositionChangeRef.current?.({ latitude: position.lat, longitude: position.lng })
          })
        }
        map.addControl(new goongjs.NavigationControl({ showCompass: false }), 'top-right')
        cleanup = () => {
          marker.remove()
          map.remove()
        }
      })
      .catch(() => {
        if (!disposed) setFailed(true)
      })

    return () => {
      disposed = true
      cleanup()
    }
  }, [draggable, latitude, longitude])

  if (!env.goongMaptilesKey || failed) {
    return (
      <div data-testid="goong-map" className={`${className} bg-surface-container text-on-surface-variant flex items-center justify-center rounded-xl`}>
        Bản đồ không khả dụng; địa chỉ vẫn được lưu.
      </div>
    )
  }

  return <div data-testid="goong-map" ref={containerRef} className={`${className} overflow-hidden rounded-xl`} aria-label="Bản đồ vị trí" />
}
