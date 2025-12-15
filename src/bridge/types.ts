/**
 * Bridge-specific types and configurations
 */

/**
 * Bridge client credentials obtained during registration
 */
export interface BridgeClientCredentials {
  username: string;
  clientkey: string;
}

/**
 * Bridge network device information
 */
export interface HueBridgeNetworkDevice {
  id: string;
  port?: number;
  internalipaddress?: string;
}

/**
 * Bridge configuration arguments
 */
export interface HueBridgeArgs {
  id: string;
  url: string;
  credentials: BridgeClientCredentials;
}

/**
 * Bridge configuration information
 */
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
