import { describe, expect, it } from "vitest";

const { resolveMaxWorkersForRun, resolveUseVmForks } =
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
    resolveUseVmForks: (params: {
      override: string | undefined;
      isCI: boolean;
      isMacOS: boolean;
      isWindows: boolean;
      supportsVmForks: boolean;
      lowMemLocalHost: boolean;
    }) => boolean;
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

describe("resolveUseVmForks", () => {
  it("disables vmForks on macOS CI by default", () => {
    expect(
      resolveUseVmForks({
        override: undefined,
        isCI: true,
        isMacOS: true,
        isWindows: false,
        supportsVmForks: true,
        lowMemLocalHost: false,
      }),
    ).toBe(false);
  });

  it("still honors an explicit vmForks override on macOS CI", () => {
    expect(
      resolveUseVmForks({
        override: "1",
        isCI: true,
        isMacOS: true,
        isWindows: false,
        supportsVmForks: true,
        lowMemLocalHost: false,
      }),
    ).toBe(true);
  });
});
