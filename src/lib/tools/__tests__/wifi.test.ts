import { describe, it, expect } from "vitest";
import { buildWifiPayload, escapeWifiValue } from "../wifi";

describe("escapeWifiValue", () => {
  it("escapes the special characters", () => {
    expect(escapeWifiValue("a;b")).toBe("a\\;b");
    expect(escapeWifiValue('quote"here')).toBe('quote\\"here');
    expect(escapeWifiValue("back\\slash")).toBe("back\\\\slash");
    expect(escapeWifiValue("a,b:c")).toBe("a\\,b\\:c");
  });
  it("leaves ordinary text alone", () => {
    expect(escapeWifiValue("GuestWiFi")).toBe("GuestWiFi");
  });
});

describe("buildWifiPayload", () => {
  it("builds a standard WPA payload", () => {
    expect(buildWifiPayload({ ssid: "MyNet", password: "secret123", security: "WPA" })).toBe(
      "WIFI:T:WPA;S:MyNet;P:secret123;;",
    );
  });

  it("omits the password for an open network", () => {
    expect(buildWifiPayload({ ssid: "Guest", security: "nopass" })).toBe("WIFI:T:nopass;S:Guest;;");
  });

  it("marks a hidden network", () => {
    expect(
      buildWifiPayload({ ssid: "Hidden", password: "pw", security: "WPA", hidden: true }),
    ).toBe("WIFI:T:WPA;S:Hidden;P:pw;H:true;;");
  });

  it("escapes special characters in ssid and password", () => {
    expect(
      buildWifiPayload({ ssid: "Cafe;Free", password: 'p:a"ss', security: "WPA" }),
    ).toBe('WIFI:T:WPA;S:Cafe\\;Free;P:p\\:a\\"ss;;');
  });

  it("drops an empty password even if provided", () => {
    expect(buildWifiPayload({ ssid: "Net", password: "", security: "WPA" })).toBe(
      "WIFI:T:WPA;S:Net;;",
    );
  });
});
