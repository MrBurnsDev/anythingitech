import { describe, it, expect } from "vitest";
import {
  isAllowedPort,
  isPrivateOrReservedIp,
  isValidHostname,
  isValidPort,
} from "../../../../api/_lib/net-check-validation";

describe("port validation", () => {
  it("accepts valid, allow-listed ports", () => {
    expect(isValidPort(443)).toBe(true);
    expect(isAllowedPort(443)).toBe(true);
    expect(isAllowedPort(993)).toBe(true);
  });
  it("rejects out-of-range and non-allow-listed ports", () => {
    expect(isValidPort(0)).toBe(false);
    expect(isValidPort(70000)).toBe(false);
    expect(isAllowedPort(1234)).toBe(false); // valid but not allow-listed
    expect(isAllowedPort(6667)).toBe(false);
  });
});

describe("hostname validation", () => {
  it("accepts hostnames and IP literals", () => {
    expect(isValidHostname("example.com")).toBe(true);
    expect(isValidHostname("mail.example.co.uk")).toBe(true);
    expect(isValidHostname("8.8.8.8")).toBe(true);
  });
  it("rejects junk and overly long input", () => {
    expect(isValidHostname("")).toBe(false);
    expect(isValidHostname("has space")).toBe(false);
    expect(isValidHostname("http://x.com")).toBe(false);
    expect(isValidHostname("a".repeat(300))).toBe(false);
    expect(isValidHostname("...")).toBe(false);
  });
});

describe("SSRF guard — private/reserved IPs are blocked", () => {
  it("blocks RFC1918, loopback, link-local, CGNAT, multicast", () => {
    for (const ip of [
      "10.0.0.1",
      "172.16.0.1",
      "172.31.255.255",
      "192.168.1.1",
      "127.0.0.1",
      "0.0.0.0",
      "169.254.1.1",
      "100.64.0.1",
      "224.0.0.1",
      "255.255.255.255",
    ]) {
      expect(isPrivateOrReservedIp(ip), ip).toBe(true);
    }
  });

  it("allows normal public IPs", () => {
    for (const ip of ["8.8.8.8", "1.1.1.1", "93.184.216.34", "172.15.0.1", "172.32.0.1"]) {
      expect(isPrivateOrReservedIp(ip), ip).toBe(false);
    }
  });

  it("blocks IPv6 loopback / link-local / ULA and mapped private v4", () => {
    for (const ip of ["::1", "::", "fe80::1", "fd00::1", "fc00::1", "::ffff:10.0.0.1"]) {
      expect(isPrivateOrReservedIp(ip), ip).toBe(true);
    }
    expect(isPrivateOrReservedIp("2606:4700:4700::1111")).toBe(false); // Cloudflare v6
  });
});
