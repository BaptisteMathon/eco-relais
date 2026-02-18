"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useTranslation } from "@/lib/i18n";
import type { LucideIcon } from "lucide-react";
import { ShieldCheck } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  MapPin,
  CreditCard,
  User,
  LogOut,
  ClipboardList,
  Wallet,
  Settings,
  Users,
  AlertCircle,
} from "lucide-react";

export interface NavItem {
  titleKey: string;
  href: string;
  icon: LucideIcon;
}

const clientNav: NavItem[] = [
  { titleKey: "nav.dashboard", href: "/client/dashboard", icon: LayoutDashboard },
  { titleKey: "nav.newMission", href: "/client/new-mission", icon: Package },
  { titleKey: "nav.myMissions", href: "/client/missions", icon: ClipboardList },
  { titleKey: "nav.payments", href: "/client/payments", icon: CreditCard },
  { titleKey: "nav.profile", href: "/client/profile", icon: User },
];

const partnerNav: NavItem[] = [
  { titleKey: "nav.dashboard", href: "/partner/dashboard", icon: LayoutDashboard },
  { titleKey: "nav.availableMissions", href: "/partner/available", icon: MapPin },
  { titleKey: "nav.myMissions", href: "/partner/missions", icon: ClipboardList },
  { titleKey: "nav.earnings", href: "/partner/earnings", icon: Wallet },
  { titleKey: "nav.profile", href: "/partner/profile", icon: User },
];

const adminNav: NavItem[] = [
  { titleKey: "nav.dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { titleKey: "nav.users", href: "/admin/users", icon: Users },
  { titleKey: "nav.missions", href: "/admin/missions", icon: ClipboardList },
  { titleKey: "nav.disputes", href: "/admin/disputes", icon: AlertCircle },
  { titleKey: "nav.settings", href: "/admin/settings", icon: Settings },
];

interface DashboardSidebarProps {
  role: "client" | "partner" | "admin";
}

const roleTitleKeys = {
  client: "app.title",
  partner: "app.partnerTitle",
  admin: "app.adminTitle",
} as const;

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { t } = useTranslation();
  const nav = role === "client" ? clientNav : role === "partner" ? partnerNav : adminNav;
  const titleKey = roleTitleKeys[role];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href={role === "client" ? "/client/dashboard" : role === "partner" ? "/partner/dashboard" : "/admin/dashboard"} className="flex items-center gap-2 font-semibold">
          <img src="/EcoRelais.png" alt="Logo" className="size-10" />
          <span>{t(titleKey)}</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("common.navigation")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">

        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton size="sm" className="text-muted-foreground">
                      <ShieldCheck className="size-4" />
                      <span>Informations légales</span>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/client/cgu">CGU</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/client/cgv">CGV</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/client/rgpd">RGPD</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent">
              <Avatar className="size-8">
                <AvatarImage src="" />
                <AvatarFallback>
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col text-left text-sm">
                <span className="font-medium">
                  {user?.first_name} {user?.last_name}
                </span>
                <span className="text-muted-foreground text-xs truncate">
                  {user?.email}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>{t("common.account")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${role}/profile`}>{t("common.profile")}</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 size-4" />
              {t("common.logOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
