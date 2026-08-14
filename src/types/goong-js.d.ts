declare module '@goongmaps/goong-js' {
  export interface LngLat {
    lng: number
    lat: number
  }

  export class Map {
    constructor(options: {
      container: HTMLElement
      style: string
      center: [number, number]
      zoom: number
      attributionControl?: boolean
    })
    addControl(control: unknown, position?: string): this
    remove(): void
    resize(): void
  }

  export class Marker {
    constructor(options?: { draggable?: boolean; color?: string })
    setLngLat(coordinates: [number, number]): this
    addTo(map: Map): this
    on(event: 'dragend', handler: () => void): this
    getLngLat(): LngLat
    remove(): void
  }

  export class NavigationControl {
    constructor(options?: { showCompass?: boolean; showZoom?: boolean })
  }

  const goongjs: {
    accessToken: string
    Map: typeof Map
    Marker: typeof Marker
    NavigationControl: typeof NavigationControl
  }
  export default goongjs
}

declare module '@goongmaps/goong-js/dist/goong-js.css'
