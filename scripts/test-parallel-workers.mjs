/**
 * Where: shared defaults for the parallel Vitest wrapper.
 * What: centralizes worker and pool selection so CI-specific behavior is testable.
 * Why: macOS CI has different stability constraints than Linux/Windows lanes.
 */

/**
 * @typedef {{
 *   unit: number;
 *   unitIsolated: number;
 *   extensions: number;
 *   gateway: number;
 * }} DefaultWorkerBudget
 */

/**
 * @param {{
 *   name: string;
 *   resolvedOverride: number | null;
 *   isCI: boolean;
 *   isMacOS: boolean;
 *   defaultWorkerBudget: DefaultWorkerBudget;
 * }} params
 * @returns {number | null}
 */
export function resolveMaxWorkersForRun({
  name,
  resolvedOverride,
  isCI,
  isMacOS,
  defaultWorkerBudget,
}) {
  if (resolvedOverride) {
    return resolvedOverride;
  }
  if (isCI && !isMacOS) {
    return null;
  }
  if (isCI && isMacOS) {
    // `maxWorkers=1` reuses a single worker across unrelated files and reproduces
    // shared-state leakage on macOS CI. Keep a small cap, but allow one extra worker.
    return 2;
  }
  if (name === "unit-isolated" || name.endsWith("-isolated")) {
    return defaultWorkerBudget.unitIsolated;
  }
  if (name === "extensions") {
    return defaultWorkerBudget.extensions;
  }
  if (name === "gateway") {
    return defaultWorkerBudget.gateway;
  }
  return defaultWorkerBudget.unit;
}

/**
 * @param {{
 *   override: string | undefined;
 *   isCI: boolean;
 *   isMacOS: boolean;
 *   isWindows: boolean;
 *   supportsVmForks: boolean;
 *   lowMemLocalHost: boolean;
 * }} params
 * @returns {boolean}
 */
export function resolveUseVmForks({
  override,
  isCI,
  isMacOS,
  isWindows,
  supportsVmForks,
  lowMemLocalHost,
}) {
  if (override === "1") {
    return true;
  }
  if (override === "0") {
    return false;
  }
  if (isCI && isMacOS) {
    // macOS CI still sees intermittent cross-file leakage under vmForks.
    return false;
  }
  return !isWindows && supportsVmForks && !lowMemLocalHost;
}
