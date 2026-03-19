import { describe, expect, it } from "vitest";

const { resolveMaxWorkersForRun } =
  (await import("../../scripts/test-parallel-workers.mjs")) as unknown as {
    resolveMaxWorkersForRun: (params: {
      name: string;
      resolvedOverride: number | null;
      isCI: boolean;
      isMacOS: boolean;
      defaultWorkerBudget: {
        unit: number;
        unitIsolated: number;
        extensions: number;
        gateway: number;
      };
    }) => number | null;
  };

const defaultWorkerBudget = {
  unit: 8,
  unitIsolated: 1,
  extensions: 4,
  gateway: 1,
};

describe("resolveMaxWorkersForRun", () => {
  it("uses two workers on macOS CI to avoid shared-worker cross-suite leakage", () => {
    expect(
      resolveMaxWorkersForRun({
        name: "unit-fast",
        resolvedOverride: null,
        isCI: true,
        isMacOS: true,
        defaultWorkerBudget,
      }),
    ).toBe(2);
  });

  it("keeps non-macOS CI on Vitest defaults when no override is set", () => {
    expect(
      resolveMaxWorkersForRun({
        name: "unit-fast",
        resolvedOverride: null,
        isCI: true,
        isMacOS: false,
        defaultWorkerBudget,
      }),
    ).toBeNull();
  });

  it("still honors explicit worker overrides", () => {
    expect(
      resolveMaxWorkersForRun({
        name: "gateway",
        resolvedOverride: 3,
        isCI: true,
        isMacOS: true,
        defaultWorkerBudget,
      }),
    ).toBe(3);
  });
});
