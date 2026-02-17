import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "./auth-store";

vi.mock("@/lib/api/client", () => ({
  setAuthToken: vi.fn(),
  clearAuth: vi.fn(),
}));

describe("auth-store", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
  });

  it("starts with null user and token", () => {
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });

  it("setAuth updates user and token", () => {
    const user = {
      id: "1",
      email: "u@test.com",
      role: "client" as const,
      first_name: "U",
      last_name: "T",
      phone: null,
      address_lat: null,
      address_lng: null,
      verified: true,
    };
    useAuthStore.getState().setAuth(user, "jwt-token");
    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().token).toBe("jwt-token");
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
  });

  it("logout clears user and token", () => {
    const user = {
      id: "1",
      email: "u@test.com",
      role: "client" as const,
      first_name: "U",
      last_name: "T",
      phone: null,
      address_lat: null,
      address_lng: null,
      verified: true,
    };
    useAuthStore.getState().setAuth(user, "jwt");
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });

  it("setUser updates only user", () => {
    const user = {
      id: "1",
      email: "u@test.com",
      role: "client" as const,
      first_name: "U",
      last_name: "T",
      phone: null,
      address_lat: null,
      address_lng: null,
      verified: true,
    };
    useAuthStore.getState().setAuth(user, "jwt");
    const updated = { ...user, first_name: "Updated" };
    useAuthStore.getState().setUser(updated);
    expect(useAuthStore.getState().user?.first_name).toBe("Updated");
    expect(useAuthStore.getState().token).toBe("jwt");
  });
});
