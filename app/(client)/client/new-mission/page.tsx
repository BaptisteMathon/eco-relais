"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Image from "next/image";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { missionFormSchema, type MissionFormInput } from "@/lib/validators/mission";
import { missionsApi } from "@/lib/api/endpoints";
import { AddressAutocomplete } from "@/components/client/address-autocomplete";
import { PRICE_BY_SIZE, TIME_SLOTS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils/format";
import { useTranslation, usePackageSizeLabels } from "@/lib/i18n";
import { Upload, X } from "lucide-react";

const PACKAGE_SIZES = ["small", "medium", "large"] as const;

export default function NewMissionPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const packageSizeLabels = usePackageSizeLabels();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<MissionFormInput>({
    resolver: zodResolver(missionFormSchema),
    defaultValues: {
      package_title: "",
      package_size: "medium",
      pickup_address: "",
      pickup_lat: 0,
      pickup_lng: 0,
      delivery_address: "",
      delivery_lat: 0,
      delivery_lng: 0,
      pickup_time_slot: "",
    },
  });

  const size = form.watch("package_size");
  const price = PRICE_BY_SIZE[size] ?? 0;

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }, []);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: MissionFormInput) => {
      const res = await missionsApi.create({
        ...data,
        package_size: data.package_size as "small" | "medium" | "large",
        price,
      });
      return res.data?.mission ?? res.data;
    },
    onSuccess: async (mission) => {
      const id = mission?.id;
      if (!id) return;
      try {
        const { data } = await missionsApi.createCheckout(id);
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
      } catch {
        // Payments not configured (e.g. STRIPE_SECRET_KEY not set) — mission is still created
        toast.info(t("mission.paymentsNotConfigured") || "Payments are not configured. You can view your mission below.");
      }
      toast.success(t("mission.missionCreated"));
      router.push(`/client/missions/${id}`);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || t("mission.createFailed"));
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("mission.newMission")}</CardTitle>
          <CardDescription>{t("mission.newMissionDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) => createMutation.mutate(d))}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="package_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("mission.title")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("newMission.packageTitlePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>{t("newMission.packagePhotoOptional")}</FormLabel>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  className="border-border mt-2 flex min-h-[120px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 p-4"
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="photo"
                    onChange={onFileSelect}
                  />
                  {photoPreview ? (
                    <div className="relative">
                      <Image
                        src={photoPreview}
                        alt="Preview"
                        width={200}
                        height={120}
                        className="rounded object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview(null);
                        }}
                        className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="photo" className="flex cursor-pointer flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="size-8" />
                      <span>{t("newMission.dragDropUpload")}</span>
                    </label>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="package_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("mission.packageSize")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PACKAGE_SIZES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {packageSizeLabels[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pickup_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("mission.pickupAddress")}</FormLabel>
                    <FormControl>
                      <AddressAutocomplete
                        value={field.value}
                        onChange={field.onChange}
                        onPlaceSelect={(r) => {
                          form.setValue("pickup_lat", r.lat);
                          form.setValue("pickup_lng", r.lng);
                        }}
                        placeholder={t("mission.pickupAddress")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delivery_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("mission.deliveryAddress")}</FormLabel>
                    <FormControl>
                      <AddressAutocomplete
                        value={field.value}
                        onChange={field.onChange}
                        onPlaceSelect={(r) => {
                          form.setValue("delivery_lat", r.lat);
                          form.setValue("delivery_lng", r.lng);
                        }}
                        placeholder={t("mission.deliveryAddress")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pickup_time_slot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("newMission.preferredTimeSlot")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("newMission.selectSlot")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIME_SLOTS.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-lg bg-muted p-4">
                <p className="text-muted-foreground text-sm">{t("newMission.price")}</p>
                <p className="text-2xl font-bold">{formatCurrency(price)}</p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? t("newMission.creating") : t("newMission.createAndPay")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
