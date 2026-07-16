/**
 * IPv4 subnet / CIDR calculator — pure, dependency-free, fully unit-tested.
 * Accepts "192.168.1.10/24", a bare address (treated as /32), or
 * "192.168.1.10 255.255.255.0".
 */

export interface SubnetInfo {
  ip: string;
  prefix: number;
  cidr: string;
  netmask: string;
  wildcard: string;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  totalAddresses: number;
  usableHosts: number;
  isPrivate: boolean;
  ipClass: string;
}

export function ipToInt(ip: string): number | null {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const o = Number(p);
    if (o > 255) return null;
    n = n * 256 + o;
  }
  return n >>> 0;
}

export function intToIp(n: number): string {
  const u = n >>> 0;
  return [(u >>> 24) & 255, (u >>> 16) & 255, (u >>> 8) & 255, u & 255].join(".");
}

/** Convert a mask like 255.255.255.0 to a prefix length, or null if not contiguous. */
function maskToPrefix(mask: number): number | null {
  const u = mask >>> 0;
  // A valid mask is a run of 1s followed by a run of 0s.
  const inverted = ~u >>> 0;
  if (((inverted + 1) & inverted) !== 0) return null; // not a power-of-two boundary
  let prefix = 0;
  let m = u;
  while (m & 0x80000000) {
    prefix++;
    m = (m << 1) >>> 0;
  }
  return prefix;
}

function prefixToMask(prefix: number): number {
  if (prefix <= 0) return 0;
  if (prefix >= 32) return 0xffffffff;
  return (0xffffffff << (32 - prefix)) >>> 0;
}

function isPrivate(ip: number): boolean {
  const a = (ip >>> 24) & 255;
  const b = (ip >>> 16) & 255;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local
  return false;
}

function ipClass(ip: number): string {
  const a = (ip >>> 24) & 255;
  if (a < 128) return "A";
  if (a < 192) return "B";
  if (a < 224) return "C";
  if (a < 240) return "D (multicast)";
  return "E (reserved)";
}

/** Parse the various accepted input forms into an address + prefix. */
export function parseSubnetInput(input: string): { ip: number; prefix: number } | { error: string } {
  const trimmed = input.trim();
  if (!trimmed) return { error: "Enter an IP address, e.g. 192.168.1.0/24" };

  let ipPart = trimmed;
  let prefix = 32;

  if (trimmed.includes("/")) {
    const [ipStr, prefixStr] = trimmed.split("/");
    ipPart = ipStr.trim();
    if (!/^\d{1,2}$/.test(prefixStr.trim())) return { error: "Prefix must be 0–32 (e.g. /24)" };
    prefix = Number(prefixStr.trim());
    if (prefix > 32) return { error: "Prefix must be 0–32" };
  } else if (/\s+/.test(trimmed)) {
    const [ipStr, maskStr] = trimmed.split(/\s+/);
    ipPart = ipStr.trim();
    const maskInt = ipToInt(maskStr.trim());
    if (maskInt === null) return { error: "Invalid subnet mask" };
    const p = maskToPrefix(maskInt);
    if (p === null) return { error: "Subnet mask is not contiguous" };
    prefix = p;
  }

  const ip = ipToInt(ipPart);
  if (ip === null) return { error: "Invalid IPv4 address" };
  return { ip, prefix };
}

export function computeSubnet(input: string): SubnetInfo | { error: string } {
  const parsed = parseSubnetInput(input);
  if ("error" in parsed) return parsed;
  const { ip, prefix } = parsed;

  const mask = prefixToMask(prefix);
  const wildcard = ~mask >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const totalAddresses = Math.pow(2, 32 - prefix);

  let firstHost: number;
  let lastHost: number;
  let usableHosts: number;
  if (prefix >= 32) {
    firstHost = lastHost = ip;
    usableHosts = 1;
  } else if (prefix === 31) {
    // RFC 3021 point-to-point: both addresses usable.
    firstHost = network;
    lastHost = broadcast;
    usableHosts = 2;
  } else {
    firstHost = (network + 1) >>> 0;
    lastHost = (broadcast - 1) >>> 0;
    usableHosts = totalAddresses - 2;
  }

  return {
    ip: intToIp(ip),
    prefix,
    cidr: `${intToIp(network)}/${prefix}`,
    netmask: intToIp(mask),
    wildcard: intToIp(wildcard),
    networkAddress: intToIp(network),
    broadcastAddress: intToIp(broadcast),
    firstHost: intToIp(firstHost),
    lastHost: intToIp(lastHost),
    totalAddresses,
    usableHosts,
    isPrivate: isPrivate(ip),
    ipClass: ipClass(ip),
  };
}
