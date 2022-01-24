export interface OnState {
  on: boolean
}

export interface ResourceNode {
  rid: string
  rtype:
    | "device"
    | "bridge_home"
    | "room"
    | "zone"
    | "light"
    | "button"
    | "temperature"
    | "light_level"
    | "motion"
    | "entertainment"
    | "grouped_light"
    | "device_power"
    | "zigbee_bridge_connectivity"
    | "zigbee_connectivity"
    | "zgp_connectivity"
    | "bridge"
    | "homekit"
    | "scene"
    | "entertainment_configuration"
    | "public_image"
    | "auth_v1"
    | "behavior_script"
    | "behavior_instance"
    | "geofence"
    | "geofence_client"
    | "geolocation"
}

export interface Position {
  x: number
  y: number
  z: number
}

interface EntertainmentAreaChannel {
  channel_id: number
  position: Position[]
  members: Array<{
    index: number
    service: ResourceNode
  }>
}

interface ServiceLocation {
  position: Position
  positions: Position[]
  service: ResourceNode
}

export interface EntertainmentArea {
  channels: EntertainmentAreaChannel[]
  configuration_type: string
  id: string
  id_v1: string
  light_services: ResourceNode[]
  locations: { service_locations: ServiceLocation[] }
  metadata: { name: string }
  name: string
  status: string
  stream_proxy: {
    mode: string
    node: ResourceNode
  }
  type: string
}

export interface xy {
  x: number
  y: number
}

interface LightDimming {
  brightness: number
  min_dim_level?: number
}

export interface Light {
  alert: { action_values: string[] }
  color: {
    gamut: { blue: xy; green: xy; red: xy }
    gamut_type: string
    xy: xy
  }
  color_temperature: {
    mirek: number
    mirek_schema?: { mirek_maximum: number; mirek_minimum: number }
    mirek_valid?: boolean
  }
  dimming: LightDimming
  dynamics: {
    speed: number
    speed_valid: boolean
    status: string
    status_values: string[]
  }
  effects: {
    effect_values: string[]
    status: string
    status_values: string[]
  }
  gradient?: { points: Array<{ color: { xy: xy } }>; points_capable: number }
  id: string
  id_v1: string
  metadata: { archetype: string; name: string }
  mode: string
  on: OnState
  owner: ResourceNode
  type: string
}

interface SceneAction {
  target: ResourceNode
  action: {
    on: OnState
    dimming: LightDimming
    color_temperature: { mirek: number }
  }
}

export interface Scene {
  actions: SceneAction[]
  group: ResourceNode
  id: string
  id_v1: string
  metadata: {
    image: ResourceNode
    name: string
  }
  palette: {
    color: xy
    dimming: LightDimming
    color_temperature: Array<{
      color_temperature: { mirek: number }
      dimming: LightDimming
    }>
  }
  speed: number
  type: string
}

export interface Room {
  children: ResourceNode[]
  grouped_services: ResourceNode[]
  id: string
  id_v1: string
  metadata: { archetype: string; name: string }
  services: ResourceNode[]
  type: string
}

export interface Zone {
  type: string
  id: string
  id_v1: string
  children: ResourceNode[]
  services: ResourceNode[]
  grouped_services: ResourceNode[]
  metadata: {
    name: string
    archetype: string
  }
}

export interface Device {
  id: string
  id_v1: string
  type: string
  services: ResourceNode[]
  metadata: { archetype: string; name: string }
  product_data: {
    certified: boolean
    manufacturer_name: string
    model_id: string
    product_archetype: string
    product_name: string
    software_version: string
  }
}

export interface BridgeHome {
  children: ResourceNode[]
  grouped_services: ResourceNode[]
  id: string
  id_v1: string
  services: ResourceNode[]
  type: string
}

export interface LightGroup {
  alert: { action_values: string[] }
  id: string
  id_v1: string
  on: OnState
  type: string
}
