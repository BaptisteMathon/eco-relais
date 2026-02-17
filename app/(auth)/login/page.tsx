"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { authApi } from "@/lib/api/endpoints";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useTranslation } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { t } = useTranslation();

  const isDev = process.env.NODE_ENV === "development";
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: isDev
      ? { email: "client@eco-relais.test", password: "Password123!" }
      : { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) =>
      authApi.login(data.email, data.password).then((r) => r.data),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success(t("auth.welcomeBack"));
      const role = data.user.role;
      if (role === "admin") router.push("/admin/dashboard");
      else if (role === "partner") router.push("/partner/dashboard");
      else router.push("/client/dashboard");
    },
    onError: (err: { response?: { data?: { message?: string; error?: string } }; message?: string }) => {
      const data = err.response?.data;
      toast.error(data?.error ?? data?.message ?? err.message ?? t("auth.loginFailed"));
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("auth.signInTitle")}</CardTitle>
        <CardDescription>{t("auth.signInDescription")}</CardDescription>
        {isDev && (
          <p className="text-muted-foreground mt-2 rounded-md bg-muted/50 px-3 py-2 text-xs">
            {t("auth.devAutofill")}
          </p>
        )}
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((d) => loginMutation.mutate(d))}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.email")}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={t("auth.emailPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.password")}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={t("auth.passwordPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? t("auth.signingIn") : t("auth.signIn")}
            </Button>
            <p className="text-muted-foreground text-center text-sm">
              {t("auth.noAccount")}{" "}
              <Link href="/register" className="text-primary underline">
                {t("auth.register")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
