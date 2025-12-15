// Entertainment API Constants
export const ENTERTAINMENT_API = {
  PORT: 2100,
  PROTOCOL_NAME: "HueStream",
  PROTOCOL_VERSION: [0x02, 0x00] as const, // V2.0
  SEQUENCE_NUMBER: 0x00,
  RESERVED_SPACE: 0x00,
  COLOR_MODE: {
    RGB: 0x00,
    XY: 0x01,
  } as const,
  CIPHER_SUITE: "TLS_PSK_WITH_AES_128_GCM_SHA256",
  DEFAULT_TIMEOUT: 1000,
} as const;

// API Endpoints
export const API_PATHS = {
  CONFIG: "/api/0/config",
  CLIP_V2_RESOURCE: "/clip/v2/resource",
} as const;

// Discovery
export const DISCOVERY = {
  MDNS_SERVICE: "_hue._tcp.local",
  CLOUD_API: "https://discovery.meethue.com/",
} as const;
