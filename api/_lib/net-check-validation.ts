/**
 * Validation + SSRF guards for the net-check serverless function.
 *
 * Pure and unit-tested. The handler MUST reject any target that resolves to a
 * private/reserved address, or a port outside the allow-list, so the endpoint
 * can't be turned into an internal port scanner.
 */

export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

/** Common client-facing service ports — deliberately not a general scanner. */
export const ALLOWED_PORTS = new Set<number>([
  21, 22, 25, 53, 80, 110, 143, 443, 465, 587, 993, 995, 3306, 3389, 5432, 8080, 8443,
]);

export function isAllowedPort(port: number): boolean {
  return ALLOWED_PORTS.has(port);
}

export function isValidHostname(host: string): boolean {
  if (!host || host.length > 253) return false;
  // Letters, digits, dots, hyphens, and colons (for IPv6 literals) only, and it
  // must contain at least one alphanumeric character.
  if (!/^[a-zA-Z0-9.:-]+$/.test(host)) return false;
  if (!/[a-zA-Z0-9]/.test(host)) return false;
  return true;
}

function isPrivateOrReservedIpv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((o) => !Number.isInteger(o) || o < 0 || o > 255)) {
    return true; // unparseable → treat as unsafe
  }
  const [a, b] = parts;
  if (a === 0) return true; // "this" network
  if (a === 10) return true; // RFC1918
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local
  if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918
  if (a === 192 && b === 168) return true; // RFC1918
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64/10
  if (a >= 224) return true; // multicast / reserved / broadcast
  return false;
}

/** True if the address is loopback/private/link-local/reserved (block it). */
export function isPrivateOrReservedIp(ip: string): boolean {
  const low = ip.toLowerCase().trim();
  if (low.includes(":")) {
    if (low === "::1" || low === "::") return true; // loopback / unspecified
    // fe80::/10 link-local
    if (/^fe[89ab]/.test(low)) return true;
    // fc00::/7 unique-local
    if (/^f[cd]/.test(low)) return true;
    // IPv4-mapped ::ffff:a.b.c.d
    const mapped = /::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(low);
    if (mapped) return isPrivateOrReservedIpv4(mapped[1]);
    return false;
  }
  return isPrivateOrReservedIpv4(low);
}
