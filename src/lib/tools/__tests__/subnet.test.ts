import { describe, it, expect } from "vitest";
import { computeSubnet, ipToInt, intToIp, parseSubnetInput } from "../subnet";

const ok = (input: string) => {
  const r = computeSubnet(input);
  if ("error" in r) throw new Error(`unexpected error: ${r.error}`);
  return r;
};

describe("ipToInt / intToIp", () => {
  it("round-trips addresses", () => {
    for (const ip of ["0.0.0.0", "192.168.1.1", "255.255.255.255", "10.0.0.1"]) {
      expect(intToIp(ipToInt(ip)!)).toBe(ip);
    }
  });
  it("rejects malformed addresses", () => {
    expect(ipToInt("256.0.0.1")).toBeNull();
    expect(ipToInt("1.2.3")).toBeNull();
    expect(ipToInt("a.b.c.d")).toBeNull();
  });
});

describe("computeSubnet — /24", () => {
  const r = ok("192.168.1.10/24");
  it("computes network, broadcast, mask, hosts", () => {
    expect(r.networkAddress).toBe("192.168.1.0");
    expect(r.broadcastAddress).toBe("192.168.1.255");
    expect(r.netmask).toBe("255.255.255.0");
    expect(r.wildcard).toBe("0.0.0.255");
    expect(r.firstHost).toBe("192.168.1.1");
    expect(r.lastHost).toBe("192.168.1.254");
    expect(r.totalAddresses).toBe(256);
    expect(r.usableHosts).toBe(254);
    expect(r.isPrivate).toBe(true);
    expect(r.ipClass).toBe("C");
    expect(r.cidr).toBe("192.168.1.0/24");
  });
});

describe("computeSubnet — edge prefixes", () => {
  it("/30 has 2 usable hosts", () => {
    const r = ok("10.0.0.1/30");
    expect(r.networkAddress).toBe("10.0.0.0");
    expect(r.broadcastAddress).toBe("10.0.0.3");
    expect(r.firstHost).toBe("10.0.0.1");
    expect(r.lastHost).toBe("10.0.0.2");
    expect(r.usableHosts).toBe(2);
  });
  it("/31 is point-to-point (RFC 3021): 2 usable, both addresses", () => {
    const r = ok("10.0.0.0/31");
    expect(r.usableHosts).toBe(2);
    expect(r.firstHost).toBe("10.0.0.0");
    expect(r.lastHost).toBe("10.0.0.1");
  });
  it("/32 is a single host", () => {
    const r = ok("8.8.8.8/32");
    expect(r.usableHosts).toBe(1);
    expect(r.firstHost).toBe("8.8.8.8");
    expect(r.lastHost).toBe("8.8.8.8");
    expect(r.totalAddresses).toBe(1);
  });
  it("/8 counts the full range", () => {
    const r = ok("10.20.30.40/8");
    expect(r.networkAddress).toBe("10.0.0.0");
    expect(r.broadcastAddress).toBe("10.255.255.255");
    expect(r.totalAddresses).toBe(16777216);
    expect(r.usableHosts).toBe(16777214);
  });
  it("/0 covers the whole space without overflow", () => {
    const r = ok("0.0.0.0/0");
    expect(r.netmask).toBe("0.0.0.0");
    expect(r.broadcastAddress).toBe("255.255.255.255");
    expect(r.totalAddresses).toBe(4294967296);
  });
});

describe("input forms", () => {
  it("accepts a bare address as /32", () => {
    const r = ok("192.168.0.5");
    expect(r.prefix).toBe(32);
  });
  it("accepts 'ip mask' form", () => {
    const r = ok("192.168.1.10 255.255.255.0");
    expect(r.prefix).toBe(24);
    expect(r.networkAddress).toBe("192.168.1.0");
  });
  it("rejects a non-contiguous mask", () => {
    const r = computeSubnet("192.168.1.10 255.0.255.0");
    expect("error" in r).toBe(true);
  });
  it("rejects a bad prefix and bad IP", () => {
    expect("error" in computeSubnet("192.168.1.0/33")).toBe(true);
    expect("error" in computeSubnet("999.1.1.1/24")).toBe(true);
    expect("error" in parseSubnetInput("")).toBe(true);
  });
});

describe("public vs private classification", () => {
  it("flags RFC1918 + loopback as private, public otherwise", () => {
    expect(ok("10.1.2.3/8").isPrivate).toBe(true);
    expect(ok("172.16.5.5/12").isPrivate).toBe(true);
    expect(ok("192.168.1.1/24").isPrivate).toBe(true);
    expect(ok("127.0.0.1/8").isPrivate).toBe(true);
    expect(ok("8.8.8.8/32").isPrivate).toBe(false);
  });
});
