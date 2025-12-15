/**
 * Hue Bridge discovery functionality
 */

import mdns from "node-dns-sd";
import type { HueBridgeNetworkDevice, BridgeClientCredentials } from "./types";
import { HueBridgeDiscoveryError } from "../errors";
import { DISCOVERY } from "../constants";

/**
 * Discovers Philips Hue Bridges on the local network using mDNS.
 * Falls back to Philips cloud discovery API if mDNS fails.
 *
 * @returns Array of discovered bridge devices
 * @throws {HueBridgeDiscoveryError} If both mDNS and cloud API discovery fail
 *
 * @example
 * const bridges = await discover();
 * console.log(`Found ${bridges.length} bridge(s)`);
 */
export async function discover(): Promise<HueBridgeNetworkDevice[]> {
  try {
    console.log("DISCOVERY.MDNS_SERVICE", DISCOVERY.MDNS_SERVICE);
    const localSearch = await mdns.discover({
      name: DISCOVERY.MDNS_SERVICE,
    });

    console.log("localSearch", localSearch);

    return localSearch.map((item) => {
      const port = item.service.port;
      const internalipaddress = item.address;
      const [buffer] = item.packet.additionals;
      const id = buffer.rdata.bridgeid;

      return {
        id,
        port,
        internalipaddress,
      };
    });
  } catch (mdnsError) {
    try {
      const response = await fetch(DISCOVERY.CLOUD_API);

      if (!response.ok) {
        throw new HueBridgeDiscoveryError(
          `Failed to discover bridges via cloud API: ${response.statusText}`,
          mdnsError
        );
      }

      return response.json();
    } catch (fetchError) {
      throw new HueBridgeDiscoveryError(
        "Failed to discover Hue Bridges via both mDNS and cloud API",
        { mdnsError, fetchError }
      );
    }
  }
}

/**
 * Registers the application with a Hue Bridge to obtain credentials.
 * The physical button on the bridge must be pressed before calling this method.
 *
 * @param url - The IP address of the bridge
 * @param devicetype - The application identifier (default: "hue-sync")
 * @returns Bridge client credentials (username and clientkey)
 * @throws {Error} If the link button was not pressed or registration fails
 *
 * @example
 * const credentials = await register("192.168.1.100");
 * // Save credentials for future use
 */
export async function register(
  url: string,
  devicetype: string = "hue-sync"
): Promise<BridgeClientCredentials> {
  const endpoint = `http://${url}/api`;
  const body = JSON.stringify({
    devicetype,
    generateclientkey: true,
  });

  const response = await fetch(endpoint, {
    body,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  type CredentialsResponse = {
    error: Error[];
    success: BridgeClientCredentials;
  };

  const [{ error, success }]: CredentialsResponse[] = await response.json();

  if (error) throw error;

  return success;
}
