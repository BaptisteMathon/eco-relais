"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useTranslation } from "@/lib/i18n";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Header } from "@/components/layout/header";

type Role = "client" | "partner" | "admin";

const ROLE_PREFIX: Record<Role, string> = {
  client: "/client",
  partner: "/partner",
  admin: "/admin",
};

interface ProtectedLayoutProps {
  children: React.ReactNode;
  role: Role;
  title?: string;
}

export function ProtectedLayout({ children, role, title }: ProtectedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAuthenticated() || !user) {
      router.replace("/login");
      return;
    }
    if (user.role !== role) {
      const base = ROLE_PREFIX[user.role as Role];
      router.replace(base + "/dashboard");
    }
  }, [user, role, isAuthenticated, router]);

  if (typeof window !== "undefined" && (!user || user.role !== role)) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <DashboardSidebar role={role} />
      <SidebarInset>
        <Header title={title} />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
