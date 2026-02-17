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
import { adminApi } from "@/lib/api/endpoints";
import { useTranslation } from "@/lib/i18n";
import { MoreHorizontal, UserX, Trash2 } from "lucide-react";

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", roleFilter === "all" ? undefined : roleFilter],
    queryFn: () =>
      adminApi.users({ role: roleFilter === "all" ? undefined : roleFilter }).then((r) => r.data),
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("admin.users")}</h2>
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.allUsers")}</CardTitle>
          <CardDescription>{t("admin.manageAccounts")}</CardDescription>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
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
        </CardContent>
      </Card>
    </div>
  );
}
