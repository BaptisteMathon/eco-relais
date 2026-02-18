import { api } from "./client";
import type {
  User,
  Mission,
  Transaction,
  LoginResponse,
  PaginatedResponse,
  AvailableMission,
  Dispute,
  AdminStatsResponse,
} from "@/lib/types";

// Backend base path: /api (see backend/src/routes/index.ts)

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>("/auth/login", { email, password }),
  register: (body: {
    email: string;
    password: string;
    role: "client" | "partner";
    first_name: string;
    last_name: string;
    phone?: string;
    address?: string;
    address_lat?: number;
    address_lng?: number;
  }) => api.post<LoginResponse>("/auth/register", body),
  /** Current user profile (backend: GET /users/profile) */
  me: () =>
    api.get<{ success: boolean; user: User }>("/users/profile").then((r) => ({
      ...r,
      data: r.data?.user,
    })),
};

// Missions (client: own list; backend GET /missions returns { success, missions })
export const missionsApi = {
  list: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<{ success: boolean; missions: Mission[] }>("/missions", { params }),
  get: (id: string) =>
    api.get<{ success: boolean; mission: Mission }>(`/missions/${id}`).then((r) => ({
      ...r,
      data: r.data?.mission,
    })),
  create: (body: {
    package_photo_url?: string;
    package_title: string;
    package_size: string;
    pickup_address: string;
    pickup_lat: number;
    pickup_lng: number;
    delivery_address: string;
    delivery_lat: number;
    delivery_lng: number;
    pickup_time_slot: string;
    price?: number;
  }) => api.post<{ success: boolean; mission: Mission }>("/missions", body),
  cancel: (id: string) =>
    api.put<{ success: boolean; mission: Mission }>(`/missions/${id}/cancel`),
  createCheckout: (missionId: string) =>
    api.post<{ success: boolean; url: string; session_id?: string }>(
      "/payments/create-checkout",
      { mission_id: missionId }
    ),
};

// Partner (backend: same GET/PUT /missions with role=partner; GET with lat/lng = nearby, without = assigned)
export const partnerApi = {
  available: (lat: number, lng: number, radiusKm = 1) =>
    api
      .get<{ success: boolean; missions: Mission[] }>("/missions", {
        params: { lat, lng, radius: radiusKm * 1000 },
      })
      .then((r) => ({ ...r, data: r.data?.missions ?? [] })),
  myMissions: (params?: { status?: string }) =>
    api.get<{ success: boolean; missions: Mission[] }>("/missions", { params }),
  accept: (missionId: string) =>
    api.put<{ success: boolean; mission: Mission }>(`/missions/${missionId}/accept`),
  markCollected: (missionId: string, qrPayload?: string) =>
    api.put<{ success: boolean; mission: Mission }>(`/missions/${missionId}/collect`, {
      qr_payload: qrPayload,
    }),
  markInTransit: (missionId: string) =>
    api.put<{ success: boolean; mission: Mission }>(`/missions/${missionId}/status`, {
      status: "in_transit",
    }),
  markDelivered: (missionId: string, qrPayload?: string) =>
    api.put<{ success: boolean; mission: Mission }>(`/missions/${missionId}/deliver`, {
      qr_payload: qrPayload,
    }),
  earnings: () =>
    api.get<{
      success: boolean;
      total_earnings: number;
      transactions: Transaction[];
    }>("/payments/earnings"),
  requestPayout: () => api.post<{ success: boolean; payout_id?: string; amount?: number; url?: string }>("/payments/payout"),
  onboardingLink: () =>
    api.post<{ success: boolean; url?: string }>("/partner/stripe/onboarding-link"),
};

// Payments (client) – backend has no GET /payments yet; stub returns empty
export const paymentsApi = {
  history: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Transaction>>("/payments", { params }),
};

// Profile (backend: PUT /users/profile)
export const profileApi = {
  update: (body: Partial<{
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
    address_lat: number;
    address_lng: number;
    password: string;
  }>) => api.put<{ success: boolean; user: User }>("/users/profile", body),
};

// Admin
export const adminApi = {
  users: (params?: { role?: string; page?: number; limit?: number }) =>
    api.get<{ success: boolean; data: User[]; total: number; page: number; limit: number }>(
      "/admin/users",
      { params }
    ),
  userAction: (userId: string, action: "suspend" | "delete") =>
    api.patch(`/admin/users/${userId}/${action}`),
  missions: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Mission>>("/admin/missions", { params }),
  missionAction: (missionId: string, action: "cancel" | "resolve") =>
    api.patch(`/admin/missions/${missionId}/${action}`),
  disputes: () => api.get<{ success: boolean; disputes: Dispute[] }>("/admin/disputes"),
  resolveDispute: (disputeId: string, resolution: string) =>
    api.patch<{ success: boolean; dispute: Dispute }>(`/admin/disputes/${disputeId}/resolve`, { resolution }),
  stats: () => api.get<AdminStatsResponse>("/admin/stats"),
};
