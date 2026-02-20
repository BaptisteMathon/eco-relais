"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { User } from "@/lib/types";
import { profileSchema, type ProfileFormInput } from "@/lib/validators/profile";
import { authApi, profileApi, partnerApi } from "@/lib/api/endpoints";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useTranslation } from "@/lib/i18n";
import { AddressAutocomplete } from "@/components/client/address-autocomplete";

export default function PartnerProfilePage() {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();
  const { t } = useTranslation();

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => authApi.me().then((r) => r.data),
  });

  const form = useForm<ProfileFormInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (me) {
      setUser(me);
      form.reset({
        first_name: me.first_name,
        last_name: me.last_name,
        phone: me.phone ?? "",
        address: me.address ?? "",
        address_lat: me.address_lat ?? undefined,
        address_lng: me.address_lng ?? undefined,
        password: "",
        confirmPassword: "",
      });
    }
  }, [me, setUser, form]);

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormInput) => {
      const payload: Parameters<typeof profileApi.update>[0] = {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || undefined,
        address: data.address,
        address_lat: data.address_lat,
        address_lng: data.address_lng,
      };
      if (data.password) payload.password = data.password;
      return profileApi.update(payload).then((r) => r.data);
    },
    onSuccess: (updated: { success?: boolean; user?: User }) => {
      const userData = updated?.user ?? updated;
      setUser(userData as User);
      queryClient.setQueryData(["me"], userData);
      form.reset({ ...form.getValues(), password: "", confirmPassword: "" });
      toast.success(t("profile.profileUpdated"));
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || t("profile.updateFailed"));
    },
  });

  const stripeOnboardingMutation = useMutation({
    mutationFn: () => partnerApi.onboardingLink().then((r) => r.data),
    onSuccess: (data) => {
      if (data?.url) window.location.href = data.url;
      else toast.error(t("profile.onboardingLinkError"));
    },
    onError: () => toast.error(t("profile.onboardingLinkError")),
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("common.profile")}</h2>
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.personalInfo")}</CardTitle>
          <CardDescription>{t("profile.updateNamePhoneAddress")}</CardDescription>
          {me?.address && (
            <p className="text-muted-foreground text-sm">
              {t("profile.savedAddress")}: {me.address}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) => updateMutation.mutate(d))}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile.firstName")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile.lastName")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("profile.phone")}</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("profile.address")}</FormLabel>
                    <FormControl>
                      <AddressAutocomplete
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onPlaceSelect={(r) => {
                          form.setValue("address_lat", r.lat);
                          form.setValue("address_lng", r.lng);
                        }}
                      />
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
                    <FormLabel>{t("profile.newPasswordOptional")}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("profile.confirmNewPassword")}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? t("profile.saving") : t("profile.saveChanges")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.payoutSettings")}</CardTitle>
          <CardDescription>{t("profile.connectStripeReceivePayments")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => stripeOnboardingMutation.mutate()}
            disabled={stripeOnboardingMutation.isPending || !!user?.stripe_account_id}
          >
            {user?.stripe_account_id ? t("profile.stripeConnected") : t("profile.connectStripeAccount")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
