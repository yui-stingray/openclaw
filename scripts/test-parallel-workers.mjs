/**
 * Where: shared worker defaults for the parallel Vitest wrapper.
 * What: centralizes `maxWorkers` selection so CI-specific behavior is testable.
 * Why: macOS CI with a single worker leaks state between otherwise healthy suites.
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
