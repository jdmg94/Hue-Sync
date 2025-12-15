import type { LookupFunction } from "net";

/**
 * Patches Node's DNS lookup to resolve a specific domain to a given IP address.
 * This is used to enable HTTPS with proper certificate validation for Hue Bridges.
 *
 * @param domain - The domain pattern to intercept (e.g., bridge ID)
 * @param ip - The IP address to resolve the domain to
 */
export function patchDNS(domain: string, ip: string): void {
  // Using require for runtime patching is intentional and necessary
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dns = require("dns");
  const query = new RegExp(domain, "i");
  const originalLookup: LookupFunction = dns.lookup;

  const newLookup: LookupFunction = (hostname, options, callback) => {
    if (query.test(hostname)) {
      return callback(null, [{ family: 4, address: ip }]);
    }

    return originalLookup(hostname, options, callback);
  };

  dns.lookup = newLookup;
}
