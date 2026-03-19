/**
 * Where: type surface for the shared test-parallel worker helper.
 * What: describes the JS helper so TS-driven checks can import it safely.
 * Why: CI `check` runs type analysis over script tests even though the runtime helper is `.mjs`.
 */

export interface DefaultWorkerBudget {
  unit: number;
  unitIsolated: number;
  extensions: number;
  gateway: number;
}

export interface ResolveMaxWorkersForRunParams {
  name: string;
  resolvedOverride: number | null;
  isCI: boolean;
  isMacOS: boolean;
  defaultWorkerBudget: DefaultWorkerBudget;
}

export function resolveMaxWorkersForRun(params: ResolveMaxWorkersForRunParams): number | null;
