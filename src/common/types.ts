/**
 * Common types shared across the Hue Sync library
 */

/**
 * Generic JSON response wrapper from Hue Bridge API
 */
export interface JSONResponse<T extends {}> {
  errors?: Error[];
  data: T;
}

/**
 * Resource reference node used in Hue API responses
 */
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

/**
 * Request options for HTTP requests to the bridge
 */
export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  keepAlive?: boolean;
}
