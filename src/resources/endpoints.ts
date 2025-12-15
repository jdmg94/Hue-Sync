/**
 * Resource endpoint mappings and type utilities
 */

import type {
  Light,
  Scene,
  Room,
  Zone,
  Device,
  HomeArea,
  LightGroup,
  GeoFenceClient,
  BehaviourInstance,
} from "./types";
import type { EntertainmentArea } from "../streaming/types";

/**
 * Mapping of resource types to their API endpoint paths
 */
export const RESOURCE_ENDPOINTS = {
  light: "light",
  lightGroup: "grouped_light",
  scene: "scene",
  room: "room",
  zone: "zone",
  entertainmentArea: "entertainment_configuration",
  homeArea: "bridge_home",
  device: "device",
  geoFenceClient: "geofence_client",
  behaviorInstance: "behavior_instance",
} as const;

export type ResourceEndpointKey = keyof typeof RESOURCE_ENDPOINTS;

/**
 * Type mapping from resource keys to their TypeScript interfaces
 */
export interface ResourceTypeMap {
  light: Light;
  lightGroup: LightGroup;
  scene: Scene;
  room: Room;
  zone: Zone;
  entertainmentArea: EntertainmentArea;
  homeArea: HomeArea;
  device: Device;
  geoFenceClient: GeoFenceClient;
  behaviorInstance: BehaviourInstance;
}
