export interface HueBridgeArgs {
  id: string;
  url: string;
  credentials: BridgeClientCredentials;
}

export type JSONResponse<T extends {}> = {
  errors?: Error[];
  data: T;
};

interface BaseResouce {
  id: string;
  id_v1?: string;
  type: string;
}

export interface OnState {
  on: boolean;
}

export interface ResourceNode {
  rid: string;
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
    | "_test";
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

interface EntertainmentAreaChannel {
  channel_id: number;
  position: Position[];
  members: Array<{
    index: number;
    service: ResourceNode;
  }>;
}

interface ServiceLocation {
  position: Position;
  positions: Position[];
  service: ResourceNode;
}

export interface EntertainmentArea extends BaseResouce {
  name: string;
  metadata: { name: string };
  channels: EntertainmentAreaChannel[];
  configuration_type: string;
  light_services: ResourceNode[];
  locations: { service_locations: ServiceLocation[] };
  status: string;
  stream_proxy: {
    mode: string;
    node: ResourceNode;
  };
}

export interface xy {
  x: number;
  y: number;
}

interface LightDimming {
  brightness: number;
  min_dim_level?: number;
}

export interface Light extends BaseResouce {
  alert: { action_values: string[] };
  color: {
    gamut: { blue: xy; green: xy; red: xy };
    gamut_type: string;
    xy: xy;
  };
  color_temperature: {
    mirek: number;
    mirek_schema?: { mirek_maximum: number; mirek_minimum: number };
    mirek_valid?: boolean;
  };
  dimming: LightDimming;
  dynamics: {
    speed: number;
    speed_valid: boolean;
    status: string;
    status_values: string[];
  };
  effects: {
    effect_values: string[];
    status: string;
    status_values: string[];
  };
  gradient?: { points: Array<{ color: { xy: xy } }>; points_capable: number };
  metadata: { archetype?: string; name: string };
  mode: string;
  on: OnState;
  owner: ResourceNode;
}

interface SceneAction {
  target: ResourceNode;
  action: {
    on?: OnState;
    dimming?: LightDimming;
    color_temperature?: { mirek: number };
  };
}

export interface Scene extends BaseResouce {
  speed?: number;
  group: ResourceNode;
  actions: SceneAction[];
  metadata: {
    image?: ResourceNode;
    name: string;
  };
  palette?: {
    color: xy;
    dimming: LightDimming;
    color_temperature: Array<{
      color_temperature: { mirek: number };
      dimming?: LightDimming;
    }>;
  };
}

export interface Room extends BaseResouce {
  children: ResourceNode[];
  grouped_services?: ResourceNode[];
  metadata: { archetype?: string; name: string };
  services?: ResourceNode[];
}

export interface Zone extends BaseResouce {
  children: ResourceNode[];
  services?: ResourceNode[];
  grouped_services?: ResourceNode[];
  metadata: {
    name: string;
    archetype?: string;
  };
}

export interface Device extends BaseResouce {
  services: ResourceNode[];
  metadata: {
    name?: string;
    archetype?:
      | "bridge_v2"
      | "unknown_archetype"
      | "classic_bulb"
      | "sultan_bulb"
      | "flood_bulb"
      | "spot_bulb"
      | "candle_bulb"
      | "luster_bulb"
      | "pendant_round"
      | "pendant_long"
      | "ceiling_round"
      | "ceiling_square"
      | "floor_shade"
      | "floor_lantern"
      | "table_shade"
      | "recessed_ceiling"
      | "recessed_floor"
      | "single_spot"
      | "double_spot"
      | "table_wash"
      | "wall_lantern"
      | "wall_shade"
      | "flexible_lamp"
      | "ground_spot"
      | "wall_spot"
      | "plug"
      | "hue_go"
      | "hue_lightstrip"
      | "hue_iris"
      | "hue_bloom"
      | "bollard"
      | "wall_washer"
      | "hue_play"
      | "vintage_bulb"
      | "christmas_tree"
      | "hue_centris"
      | "hue_lightstrip_tv"
      | "hue_tube"
      | "hue_signe";
  };
  product_data: {
    certified: boolean;
    manufacturer_name: string;
    model_id: string;
    product_archetype: string;
    product_name: string;
    software_version: string;
  };
}

export interface HomeArea extends BaseResouce {
  children: ResourceNode[];
  grouped_services: ResourceNode[];
  services: ResourceNode[];
}

export interface LightGroup extends BaseResouce {
  alert: { action_values: string[] };
  on: OnState;
}

export interface GeoFenceClient extends BaseResouce {
  is_at_home?: boolean;
  name: string;
}

export interface BehaviourInstance extends BaseResouce {
  script_id: string;
  enabled: boolean;
  state?: {};
  configuration: {};
  last_error?: string;
  migrated_from?: string;
  metadata: { name: string };
  status: "initializing" | "running" | "disabled" | "errored";
  dependees: Array<{
    type: string;
    target: ResourceNode;
    level: "critical" | "non_critical";
  }>;
}

export interface HueBridgeNetworkDevice {
  id: string;
  port?: number;
  internalipaddress?: string;
}

export interface BridgeClientCredentials {
  username: string;
  clientkey: string;
}

export interface BridgeConfig {
  name: string;
  datastoreversion: string;
  swversion: string;
  apiversion: string;
  mac: string;
  bridgeid: string;
  factorynew: boolean;
  replacesbridgeid?: string;
  modelid: string;
  starterkitid?: string;
}
