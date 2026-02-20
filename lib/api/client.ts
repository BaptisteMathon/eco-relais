import axios, { type AxiosError } from "axios";
import { touchActivity } from "@/lib/session-idle";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("eco_relais_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      touchActivity();
    }
  }
  return config;
});

const AUTH_PERSIST_KEY = "eco_relais_auth";

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      clearAuth();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("eco_relais_token");
}

export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("eco_relais_token", token);
  }
}

export function clearAuth(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("eco_relais_token");
    localStorage.removeItem("eco_relais_user");
    localStorage.removeItem(AUTH_PERSIST_KEY);
  }
}
