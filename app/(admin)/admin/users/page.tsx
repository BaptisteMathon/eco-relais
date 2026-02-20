"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { adminApi } from "@/lib/api/endpoints";
import { useTranslation } from "@/lib/i18n";
import { formatDate } from "@/lib/utils/format";
import type { User } from "@/lib/types";
import { MoreHorizontal, UserX, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 15, 20] as const;

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(15);
  const [detailUser, setDetailUser] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", roleFilter === "all" ? undefined : roleFilter, page, limit],
    queryFn: () =>
      adminApi
        .users({
          role: roleFilter === "all" ? undefined : roleFilter,
          page,
          limit,
        })
        .then((r) => r.data),
  });

  const suspendMutation = useMutation({
    mutationFn: (userId: string) => adminApi.userAction(userId, "suspend").then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(t("admin.userSuspended"));
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      toast.error(e.response?.data?.message || t("admin.actionFailed"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminApi.userAction(userId, "delete").then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(t("admin.userDeleted"));
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      toast.error(e.response?.data?.message || t("admin.actionFailed"));
    },
  });

  const users = data?.data ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? 1;
  const pageLimit = data?.limit ?? limit;
  const totalPages = Math.max(1, Math.ceil(total / pageLimit));
  const from = total === 0 ? 0 : (currentPage - 1) * pageLimit + 1;
  const to = Math.min(currentPage * pageLimit, total);

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleLimitChange = (value: string) => {
    setLimit(Number(value));
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("admin.users")}</h2>
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.allUsers")}</CardTitle>
          <CardDescription>{t("admin.manageAccounts")}</CardDescription>
          <div className="flex flex-wrap items-center gap-4">
            <Select value={roleFilter} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t("admin.role")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="client">{t("adminUsers.clientRole")}</SelectItem>
                <SelectItem value="partner">{t("adminUsers.partnerRole")}</SelectItem>
                <SelectItem value="admin">{t("adminUsers.adminRole")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(limit)} onValueChange={handleLimitChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t("admin.perPage")} />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center">{t("common.loading")}</p>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">{t("admin.noUsersFound")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("adminUsers.name")}</TableHead>
                  <TableHead>{t("auth.email")}</TableHead>
                  <TableHead>{t("admin.role")}</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.first_name} {u.last_name}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{u.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setDetailUser(u)}>
                            <Eye className="mr-2 size-4" />
                            {t("common.view")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => suspendMutation.mutate(u.id)}
                            disabled={suspendMutation.isPending}
                          >
                            <UserX className="mr-2 size-4" />
                            {t("admin.suspend")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(u.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="mr-2 size-4" />
                            {t("admin.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Sheet open={!!detailUser} onOpenChange={(open) => !open && setDetailUser(null)}>
            <SheetContent side="right" className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>{t("admin.userDetails") || "User details"}</SheetTitle>
                <SheetDescription>
                  {detailUser ? `${detailUser.first_name} ${detailUser.last_name}` : ""}
                </SheetDescription>
              </SheetHeader>
              {detailUser && (
                <div className="mt-6 space-y-4">
                  <p><strong>{t("adminUsers.name")}:</strong> {detailUser.first_name} {detailUser.last_name}</p>
                  <p><strong>{t("auth.email")}:</strong> {detailUser.email}</p>
                  <p><strong>{t("admin.role")}:</strong> <Badge variant="secondary">{detailUser.role}</Badge></p>
                  {detailUser.phone != null && detailUser.phone !== "" && (
                    <p><strong>{t("profile.phone")}:</strong> {detailUser.phone}</p>
                  )}
                  {(detailUser as { address?: string | null }).address != null && (detailUser as { address?: string | null }).address !== "" && (
                    <p><strong>{t("profile.address")}:</strong> {(detailUser as { address?: string }).address}</p>
                  )}
                  {(detailUser as { created_at?: string }).created_at && (
                    <p className="text-muted-foreground text-sm">
                      {t("common.created")}: {formatDate((detailUser as { created_at: string }).created_at)}
                    </p>
                  )}
                </div>
              )}
            </SheetContent>
          </Sheet>

          {!isLoading && total > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t pt-4">
              <p className="text-muted-foreground text-sm">
                {t("admin.showingXOfY")
                  .replace("{from}", String(from))
                  .replace("{to}", String(to))
                  .replace("{total}", String(total))}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="size-4" />
                  {t("admin.previous")}
                </Button>
                <span className="text-muted-foreground text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  {t("admin.next")}
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
