"use client";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminDisputesPage from "./page";

const queryClient = new QueryClient();
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const mockDisputes = vi.fn();
const mockResolveDispute = vi.fn();

vi.mock("@/lib/api/endpoints", () => ({
  adminApi: {
    disputes: () =>
      mockDisputes().then((disputes: unknown) => ({ data: { disputes } })),
    resolveDispute: (id: string, resolution: string) =>
      mockResolveDispute(id, resolution).then(() => ({
        data: { dispute: { id, status: "resolved", resolution } },
      })),
  },
}));

vi.mock("@/lib/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("AdminDisputesPage", () => {
  beforeEach(() => {
    queryClient.clear();
    mockDisputes.mockReset();
    mockResolveDispute.mockReset();
  });

  it("renders page title and card", () => {
    mockDisputes.mockResolvedValue([]);
    render(<AdminDisputesPage />, { wrapper });
    expect(screen.getByText("admin.disputes")).toBeInTheDocument();
    expect(screen.getByText("admin.disputeQueue")).toBeInTheDocument();
    expect(screen.getByText("admin.reviewDisputes")).toBeInTheDocument();
  });

  it("shows loading then empty state when no disputes", async () => {
    mockDisputes.mockImplementation(
      () => new Promise((r) => setTimeout(() => r([]), 10))
    );
    render(<AdminDisputesPage />, { wrapper });
    expect(screen.getByText("common.loading")).toBeInTheDocument();
    await screen.findByText("admin.noDisputes");
    expect(screen.queryByText("common.loading")).not.toBeInTheDocument();
  });

  it("shows table with disputes from API", async () => {
    const list = [
      {
        id: "d1",
        mission_id: "m1",
        reason: "Package damaged",
        status: "open",
        created_at: "2025-01-15T10:00:00Z",
        raised_by: "u1",
        resolution: null,
        resolved_by: null,
        resolved_at: null,
      },
    ];
    mockDisputes.mockResolvedValue(list);
    render(<AdminDisputesPage />, { wrapper });
    await screen.findByText("Package damaged");
    expect(screen.getByText("m1")).toBeInTheDocument();
    expect(screen.getByText("open")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "admin.resolve" })
    ).toBeInTheDocument();
  });

  it("opens resolve dialog and submits resolution", async () => {
    const list = [
      {
        id: "d1",
        mission_id: "m1",
        reason: "Late delivery",
        status: "open",
        created_at: "2025-01-15T10:00:00Z",
        raised_by: "u1",
        resolution: null,
        resolved_by: null,
        resolved_at: null,
      },
    ];
    mockDisputes.mockResolvedValue(list);
    mockResolveDispute.mockResolvedValue(undefined);
    render(<AdminDisputesPage />, { wrapper });
    await screen.findByText("Late delivery");
    const resolveBtn = screen.getByRole("button", { name: "admin.resolve" });
    fireEvent.click(resolveBtn);
    expect(screen.getByText("admin.resolveDispute")).toBeInTheDocument();
    const textarea = screen.getByPlaceholderText("admin.resolutionNotes");
    fireEvent.change(textarea, { target: { value: "Refund issued" } });
    const submitBtn = screen.getByRole("button", {
      name: "admin.submitResolution",
    });
    await waitFor(() => expect(submitBtn).not.toBeDisabled());
    fireEvent.click(submitBtn);
    await waitFor(() =>
      expect(mockResolveDispute).toHaveBeenCalledWith("d1", "Refund issued")
    );
  });
});
