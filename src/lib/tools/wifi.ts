/**
 * Wi-Fi QR payload builder — produces the standard `WIFI:` URI that iOS/Android
 * cameras scan to join a network. Pure and unit-tested.
 *
 * Format: WIFI:T:<auth>;S:<ssid>;P:<password>;H:<true if hidden>;;
 * Special characters (\ ; , : ") in SSID/password must be backslash-escaped.
 */

export type WifiSecurity = "WPA" | "WEP" | "nopass";

export interface WifiOptions {
  ssid: string;
  password?: string;
  security: WifiSecurity;
  hidden?: boolean;
}

/** Escape the special characters defined by the Wi-Fi QR spec. */
export function escapeWifiValue(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

export function buildWifiPayload(opts: WifiOptions): string {
  const parts = [`T:${opts.security}`, `S:${escapeWifiValue(opts.ssid)}`];
  if (opts.security !== "nopass" && opts.password) {
    parts.push(`P:${escapeWifiValue(opts.password)}`);
  }
  if (opts.hidden) parts.push("H:true");
  return `WIFI:${parts.join(";")};;`;
}
