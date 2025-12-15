/**
 * Resource type definitions for Hue Bridge devices and services
 */

import type { ResourceNode } from "../common/types";

/**
 * Base interface for all Hue resources
 */
interface BaseResource {
  id: string;
  id_v1?: string;
  type: string;
}

/**
 * On/Off state
 */
export interface OnState {
  on: boolean;
}

/**
 * XY color coordinates
 */
export interface xy {
  x: number;
  y: number;
}

/**
 * Light dimming settings
 */
interface LightDimming {
  brightness: number;
  min_dim_level?: number;
}

/**
 * Light resource
 */
export interface Light extends BaseResource {
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

/**
 * Scene action definition
 */
interface SceneAction {
  target: ResourceNode;
  action: {
    on?: OnState;
    dimming?: LightDimming;
    color_temperature?: { mirek: number };
  };
}

/**
 * Scene resource
 */
export interface Scene extends BaseResource {
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

/**
 * Room resource
 */
export interface Room extends BaseResource {
  children: ResourceNode[];
  grouped_services?: ResourceNode[];
  metadata: { archetype?: string; name: string };
  services?: ResourceNode[];
}

/**
 * Zone resource
 */
export interface Zone extends BaseResource {
  children: ResourceNode[];
  services?: ResourceNode[];
  grouped_services?: ResourceNode[];
  metadata: {
    name: string;
    archetype?: string;
  };
}

/**
 * Device resource
 */
export interface Device extends BaseResource {
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

/**
 * Home area resource
 */
export interface HomeArea extends BaseResource {
  children: ResourceNode[];
  grouped_services: ResourceNode[];
  services: ResourceNode[];
}

/**
 * Light group resource
 */
export interface LightGroup extends BaseResource {
  alert: { action_values: string[] };
  on: OnState;
}

/**
 * Geofence client resource
 */
export interface GeoFenceClient extends BaseResource {
  is_at_home?: boolean;
  name: string;
}

/**
 * Behavior instance resource
 */
export interface BehaviourInstance extends BaseResource {
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
