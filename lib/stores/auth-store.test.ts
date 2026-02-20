import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "./auth-store";

vi.mock("@/lib/api/client", () => ({
  setAuthToken: vi.fn(),
  clearAuth: vi.fn(),
}));

describe("auth-store", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, lastActivityAt: null });
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

  it("setAuth sets lastActivityAt", () => {
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
    const before = Date.now();
    useAuthStore.getState().setAuth(user, "jwt");
    const at = useAuthStore.getState().lastActivityAt;
    expect(at).not.toBeNull();
    expect((at as number) >= before && (at as number) <= Date.now() + 100).toBe(true);
  });

  it("touchActivity updates lastActivityAt", () => {
    useAuthStore.setState({ lastActivityAt: 1000 });
    useAuthStore.getState().touchActivity();
    const at = useAuthStore.getState().lastActivityAt;
    expect(at).not.toBe(1000);
    expect((at as number) >= Date.now() - 100).toBe(true);
  });

  it("isIdleExpired returns false when lastActivityAt is null", () => {
    useAuthStore.setState({ lastActivityAt: null });
    expect(useAuthStore.getState().isIdleExpired()).toBe(false);
  });

  it("isIdleExpired returns false when activity was recent", () => {
    useAuthStore.setState({ lastActivityAt: Date.now() });
    expect(useAuthStore.getState().isIdleExpired()).toBe(false);
  });

  it("isIdleExpired returns true when activity was more than 3h ago", () => {
    const threeHoursMs = 3 * 60 * 60 * 1000;
    useAuthStore.setState({ lastActivityAt: Date.now() - threeHoursMs - 1000 });
    expect(useAuthStore.getState().isIdleExpired()).toBe(true);
  });

  it("logout clears lastActivityAt", () => {
    useAuthStore.setState({ lastActivityAt: Date.now() });
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().lastActivityAt).toBeNull();
  });
});
