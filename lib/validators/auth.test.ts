import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerStep1Schema,
  registerStep2Schema,
  registerSchema,
} from "./auth";

describe("loginSchema", () => {
  it("accepts valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret12",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret12",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerStep1Schema", () => {
  it("accepts client or partner", () => {
    expect(registerStep1Schema.safeParse({ role: "client" }).success).toBe(true);
    expect(registerStep1Schema.safeParse({ role: "partner" }).success).toBe(true);
  });

  it("rejects invalid role", () => {
    expect(registerStep1Schema.safeParse({ role: "admin" }).success).toBe(false);
  });
});

describe("registerStep2Schema", () => {
  it("accepts valid step2 data", () => {
    const result = registerStep2Schema.safeParse({
      email: "new@example.com",
      password: "Password1!",
      firstName: "Jane",
      lastName: "Doe",
      phone: "+33600000000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty firstName", () => {
    const result = registerStep2Schema.safeParse({
      email: "new@example.com",
      password: "Password1!",
      firstName: "",
      lastName: "Doe",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts full valid register payload", () => {
    const result = registerSchema.safeParse({
      role: "client",
      email: "new@example.com",
      password: "Password1!",
      firstName: "Jane",
      lastName: "Doe",
      address: "10 Rue de Paris",
      addressLat: 48.85,
      addressLng: 2.35,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing address", () => {
    const result = registerSchema.safeParse({
      role: "client",
      email: "new@example.com",
      password: "Password1!",
      firstName: "Jane",
      lastName: "Doe",
      address: "",
      addressLat: 48.85,
      addressLng: 2.35,
    });
    expect(result.success).toBe(false);
  });
});
