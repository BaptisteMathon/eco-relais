import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDistance,
} from "./format";

describe("formatCurrency", () => {
  it("formats euros by default", () => {
    expect(formatCurrency(5)).toMatch(/5[,.]00/);
    expect(formatCurrency(12.5)).toMatch(/12[,.]50/);
  });

  it("accepts currency option", () => {
    expect(formatCurrency(10, "USD")).toContain("10");
  });
});

describe("formatDate", () => {
  it("formats date string", () => {
    const out = formatDate("2026-02-17");
    expect(out).toMatch(/17/);
    expect(out).toMatch(/2026/);
  });

  it("formats Date object", () => {
    const out = formatDate(new Date("2026-02-17"));
    expect(out).toMatch(/17/);
  });
});

describe("formatDateTime", () => {
  it("includes time", () => {
    const out = formatDateTime("2026-02-17T14:30:00Z");
    expect(out).toMatch(/17/);
    expect(out).toMatch(/\d/);
  });
});

describe("formatDistance", () => {
  it("formats meters when < 1 km", () => {
    expect(formatDistance(0.5)).toBe("500 m");
    expect(formatDistance(0.001)).toBe("1 m");
  });

  it("formats km when >= 1 km", () => {
    expect(formatDistance(1)).toBe("1.0 km");
    expect(formatDistance(2.5)).toBe("2.5 km");
  });
});
