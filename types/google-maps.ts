// Definición de tipos para Google Maps API
export namespace google {
  export namespace maps {
    export class Map {
      constructor(mapDiv: Element, opts?: MapOptions)
      setCenter(latLng: LatLng | LatLngLiteral): void
      setZoom(zoom: number): void
      fitBounds(bounds: LatLngBounds): void
      panTo(latLng: LatLng | LatLngLiteral): void
      getBounds(): LatLngBounds
      getCenter(): LatLng
      getZoom(): number
    }

    export interface MapOptions {
      center?: LatLng | LatLngLiteral
      zoom?: number
      mapTypeId?: string
      mapTypeControl?: boolean
      streetViewControl?: boolean
      fullscreenControl?: boolean
      zoomControl?: boolean
      styles?: any[]
    }

    export class LatLng {
      constructor(lat: number, lng: number)
      lat(): number
      lng(): number
      equals(other: LatLng): boolean
      toString(): string
    }

    export interface LatLngLiteral {
      lat: number
      lng: number
    }

    export class LatLngBounds {
      constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral)
      extend(point: LatLng | LatLngLiteral): LatLngBounds
      getCenter(): LatLng
      getNorthEast(): LatLng
      getSouthWest(): LatLng
      isEmpty(): boolean
      equals(other: LatLngBounds): boolean
      toString(): string
    }

    export class Marker {
      constructor(opts?: MarkerOptions)
      setMap(map: Map | null): void
      getPosition(): LatLng | null
      setPosition(latLng: LatLng | LatLngLiteral): void
      setTitle(title: string): void
      setIcon(icon: string | Icon | Symbol): void
      setVisible(visible: boolean): void
      addListener(eventName: string, handler: Function): MapsEventListener
    }

    export interface MarkerOptions {
      position?: LatLng | LatLngLiteral
      map?: Map
      title?: string
      icon?: string | Icon | Symbol
      visible?: boolean
      animation?: Animation
      draggable?: boolean
      clickable?: boolean
      zIndex?: number
    }

    export interface Icon {
      url: string
      size?: Size
      origin?: Point
      anchor?: Point
      scaledSize?: Size
    }

    export class Size {
      constructor(width: number, height: number)
      width: number
      height: number
      equals(other: Size): boolean
      toString(): string
    }

    export class Point {
      constructor(x: number, y: number)
      x: number
      y: number
      equals(other: Point): boolean
      toString(): string
    }

    export class Symbol {
      constructor(opts: SymbolOptions)
    }

    export interface SymbolOptions {
      path: SymbolPath | string
      fillColor?: string
      fillOpacity?: number
      scale?: number
      strokeColor?: string
      strokeOpacity?: number
      strokeWeight?: number
    }

    export enum SymbolPath {
      BACKWARD_CLOSED_ARROW = 0,
      BACKWARD_OPEN_ARROW = 1,
      CIRCLE = 2,
      FORWARD_CLOSED_ARROW = 3,
      FORWARD_OPEN_ARROW = 4,
    }

    export enum Animation {
      BOUNCE = 0,
      DROP = 1,
    }

    export class InfoWindow {
      constructor(opts?: InfoWindowOptions)
      open(map?: Map, anchor?: MVCObject): void
      close(): void
      setContent(content: string | Node): void
      getContent(): string | Node
      setPosition(position: LatLng | LatLngLiteral): void
      getPosition(): LatLng
      setZIndex(zIndex: number): void
      getZIndex(): number
    }

    export interface InfoWindowOptions {
      content?: string | Node
      position?: LatLng | LatLngLiteral
      maxWidth?: number
      pixelOffset?: Size
      zIndex?: number
    }

    export class Geocoder {
      constructor()
      geocode(request: GeocoderRequest, callback: (results: GeocoderResult[], status: GeocoderStatus) => void): void
    }

    export interface GeocoderRequest {
      address?: string
      location?: LatLng | LatLngLiteral
      bounds?: LatLngBounds
      componentRestrictions?: GeocoderComponentRestrictions
      region?: string
    }

    export interface GeocoderComponentRestrictions {
      country?: string | string[]
      postalCode?: string
      administrativeArea?: string
      locality?: string
      route?: string
    }

    export interface GeocoderResult {
      address_components: GeocoderAddressComponent[]
      formatted_address: string
      geometry: GeocoderGeometry
      place_id: string
      types: string[]
    }

    export interface GeocoderAddressComponent {
      long_name: string
      short_name: string
      types: string[]
    }

    export interface GeocoderGeometry {
      location: LatLng
      location_type: GeocoderLocationType
      viewport: LatLngBounds
      bounds?: LatLngBounds
    }

    export enum GeocoderLocationType {
      APPROXIMATE = 0,
      GEOMETRIC_CENTER = 1,
      RANGE_INTERPOLATED = 2,
      ROOFTOP = 3,
    }

    export enum GeocoderStatus {
      ERROR = 0,
      INVALID_REQUEST = 1,
      OK = 2,
      OVER_QUERY_LIMIT = 3,
      REQUEST_DENIED = 4,
      UNKNOWN_ERROR = 5,
      ZERO_RESULTS = 6,
    }

    export class MVCObject {
      addListener(eventName: string, handler: Function): MapsEventListener
      bindTo(key: string, target: MVCObject, targetKey?: string, noNotify?: boolean): void
      get(key: string): any
      notify(key: string): void
      set(key: string, value: any): void
      setValues(values: any): void
      unbind(key: string): void
      unbindAll(): void
    }

    export interface MapsEventListener {
      remove(): void
    }

    export class MapTypeId {
      static readonly HYBRID: string
      static readonly ROADMAP: string
      static readonly SATELLITE: string
      static readonly TERRAIN: string
    }
  }
}

// Extender Window para incluir google
declare global {
  interface Window {
    google?: {
      maps: typeof google.maps
    }
  }
}
