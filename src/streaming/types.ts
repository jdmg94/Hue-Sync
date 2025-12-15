/**
 * Entertainment API streaming types
 */

import type { ResourceNode } from "../common/types";

/**
 * 3D position coordinates
 */
export interface Position {
  x: number;
  y: number;
  z: number;
}

/**
 * Entertainment area channel configuration
 */
interface EntertainmentAreaChannel {
  channel_id: number;
  position: Position[];
  members: Array<{
    index: number;
    service: ResourceNode;
  }>;
}

/**
 * Service location within an entertainment area
 */
interface ServiceLocation {
  position: Position;
  positions: Position[];
  service: ResourceNode;
}

/**
 * Entertainment area resource for streaming
 */
export interface EntertainmentArea {
  id: string;
  id_v1?: string;
  type: string;
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
