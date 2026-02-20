"use client";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminUsersPage from "./page";

const queryClient = new QueryClient();
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const mockUsers = vi.fn();

vi.mock("@/lib/api/endpoints", () => ({
  adminApi: {
    users: (params?: { role?: string; page?: number; limit?: number }) =>
      mockUsers(params).then(
        (result: {
          data: { id: string; email: string; role: string; first_name: string; last_name: string }[];
          total: number;
          page: number;
          limit: number;
        }) => ({
          data: result,
        })
      ),
    userAction: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/lib/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("AdminUsersPage", () => {
  beforeEach(() => {
    queryClient.clear();
    mockUsers.mockReset();
  });

  it("renders page title and card", () => {
    mockUsers.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 15,
    });
    render(<AdminUsersPage />, { wrapper });
    expect(screen.getByText("admin.users")).toBeInTheDocument();
    expect(screen.getByText("admin.allUsers")).toBeInTheDocument();
    expect(screen.getByText("admin.manageAccounts")).toBeInTheDocument();
  });

  it("calls users API with default page and limit", async () => {
    mockUsers.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 15,
    });
    render(<AdminUsersPage />, { wrapper });
    await screen.findByText("admin.noUsersFound");
    expect(mockUsers).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 15 })
    );
  });

  it("shows pagination when total > 0", async () => {
    mockUsers.mockResolvedValue({
      data: [
        {
          id: "u1",
          email: "a@test.com",
          role: "client",
          first_name: "Alice",
          last_name: "User",
        },
      ],
      total: 25,
      page: 1,
      limit: 10,
    });
    render(<AdminUsersPage />, { wrapper });
    await screen.findByText("a@test.com");
    expect(screen.getByText("admin.previous")).toBeInTheDocument();
    expect(screen.getByText("admin.next")).toBeInTheDocument();
    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
  });

  it("shows user list from API", async () => {
    mockUsers.mockResolvedValue({
      data: [
        {
          id: "u1",
          email: "client@test.com",
          role: "client",
          first_name: "Client",
          last_name: "One",
        },
      ],
      total: 1,
      page: 1,
      limit: 15,
    });
    render(<AdminUsersPage />, { wrapper });
    await screen.findByText("client@test.com");
    expect(screen.getByText("Client One")).toBeInTheDocument();
    expect(screen.getByText("client")).toBeInTheDocument();
  });
});
