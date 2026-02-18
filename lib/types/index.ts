/**
 * Shared types for Eco-Relais (aligned with backend)
 */

export type UserRole = "client" | "partner" | "admin";

export type PackageSize = "small" | "medium" | "large";

export type MissionStatus =
  | "pending"
  | "accepted"
  | "collected"
  | "in_transit"
  | "delivered"
  | "cancelled";

export type TransactionStatus = "pending" | "completed" | "failed";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone: string | null;
  address_lat: number | null;
  address_lng: number | null;
  address?: string;
  verified: boolean;
  stripe_account_id?: string | null;
  created_at?: string;
}

export interface Mission {
  id: string;
  client_id: string;
  partner_id: string | null;
  package_photo_url: string | null;
  package_title: string;
  package_size: PackageSize;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  delivery_address: string;
  delivery_lat: number;
  delivery_lng: number;
  pickup_time_slot: string;
  status: MissionStatus;
  price: number;
  commission: number;
  qr_code: string | null;
  created_at: string;
  completed_at: string | null;
  client?: User;
  partner?: User;
}

export interface Transaction {
  id: string;
  mission_id: string;
  partner_id: string;
  amount: number;
  stripe_payment_intent: string | null;
  status: TransactionStatus;
  created_at: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AvailableMission extends Mission {
  distance_km?: number;
}

export interface Dispute {
  id: string;
  mission_id: string;
  raised_by: string;
  reason: string;
  status: "open" | "in_review" | "resolved";
  created_at: string;
  resolved_at?: string | null;
}

/** One bucket of admin stats growth (dashboard chart + growth % KPI). */
export interface AdminStatsGrowthPoint {
  month: string;
  users: number;
  revenue: number;
}

/** Admin dashboard stats: aggregates + time-series for chart and MoM growth. */
export interface AdminStatsResponse {
  success?: boolean;
  total_users: number;
  active_missions: number;
  revenue: number;
  growth?: AdminStatsGrowthPoint[];
}
