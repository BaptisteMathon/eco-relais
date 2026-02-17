"use client";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./page";

const queryClient = new QueryClient();
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/api/endpoints", () => ({
  authApi: {
    login: vi.fn(),
  },
}));

vi.mock("@/lib/stores/auth-store", () => ({
  useAuthStore: () => ({
    setAuth: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("LoginPage", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders sign in form with email and password fields", () => {
    render(<LoginPage />, { wrapper });
    expect(screen.getByText("auth.signInDescription")).toBeInTheDocument();
    expect(screen.getByLabelText("auth.email")).toBeInTheDocument();
    expect(screen.getByLabelText("auth.password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "auth.signIn" })).toBeInTheDocument();
  });

  it("renders link to register", () => {
    render(<LoginPage />, { wrapper });
    expect(screen.getByRole("link", { name: "auth.register" })).toHaveAttribute(
      "href",
      "/register"
    );
  });
});
