/**
 * Project SignalPath — diagnostics package barrel.
 *
 * Public surface for the diagnostics engine. The split is deliberate so a future
 * monorepo can lift the portable core (`types`, `rules`, `config`) into a shared
 * package while leaving the browser-only `measurements` adapter in the web app:
 *
 *   Portable core (no browser/React):  types.ts · rules.ts · config.ts
 *   Platform adapter (browser only):   measurements.ts
 *   Orchestration (browser only):      runAssessment.ts
 */

export * from "./types";
export * from "./config";
export * from "./rules";
export * from "./compare";
export * from "./history";
export * from "./measurements";
export * from "./runAssessment";
