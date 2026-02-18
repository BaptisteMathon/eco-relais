"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  registerStep1Schema,
  registerStep2Schema,
  registerStep3Schema,
  type RegisterStep1Input,
  type RegisterStep2Input,
  type RegisterStep3Input,
} from "@/lib/validators/auth";
import { authApi } from "@/lib/api/endpoints";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useTranslation } from "@/lib/i18n";
import { AddressAutocomplete } from "@/components/client/address-autocomplete";
import { Package, UserRound } from "lucide-react";

type Step = 1 | 2 | 3;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>(1);
  const [role, setRole] = useState<"client" | "partner">("client");
  const [step2Data, setStep2Data] = useState<RegisterStep2Input | null>(null);
  const [addressLat, setAddressLat] = useState<number>(0);
  const [addressLng, setAddressLng] = useState<number>(0);

  const step1Form = useForm<RegisterStep1Input>({
    resolver: zodResolver(registerStep1Schema),
    defaultValues: { role: "client" },
  });

  const step2Form = useForm<RegisterStep2Input>({
    resolver: zodResolver(registerStep2Schema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  const step3Form = useForm<RegisterStep3Input>({
    resolver: zodResolver(registerStep3Schema),
    defaultValues: { address: "", addressLat: 0, addressLng: 0 },
  });

  const registerMutation = useMutation({
    mutationFn: () => {
      const s2 = step2Data!;
      return authApi.register({
        email: s2.email,
        password: s2.password,
        role,
        first_name: s2.firstName,
        last_name: s2.lastName,
        phone: s2.phone || undefined,
        address: step3Form.getValues("address"),
        address_lat: addressLat,
        address_lng: addressLng,
      }).then((r) => r.data);
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success(t("register.accountCreated"));
      if (data.user.role === "partner") router.push("/partner/dashboard");
      else router.push("/client/dashboard");
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || t("register.registrationFailed"));
    },
  });

  const onStep1 = (data: RegisterStep1Input) => {
    setRole(data.role);
    setStep(2);
  };

  const onStep2 = (data: RegisterStep2Input) => {
    setStep2Data(data);
    setStep(3);
  };

  const onStep3 = (data: RegisterStep3Input) => {
    step3Form.setValue("addressLat", addressLat);
    step3Form.setValue("addressLng", addressLng);
    registerMutation.mutate();
  };

  const stepDesc = step === 1 ? t("register.step1Desc") : step === 2 ? t("register.step2Desc") : t("register.step3Desc");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("register.createAccount")}</CardTitle>
        <CardDescription>{stepDesc}</CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <Form {...step1Form}>
            <form
              onSubmit={step1Form.handleSubmit(onStep1)}
              className="space-y-6"
            >
              <FormField
                control={step1Form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("register.iAmA")}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <Label
                          htmlFor="client"
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-accent"
                        >
                          <RadioGroupItem value="client" id="client" className="sr-only" />
                          <Package className="mb-2 size-8" />
                          <span className="font-medium">{t("adminUsers.clientRole")}</span>
                          <span className="text-muted-foreground text-xs">{t("register.clientRoleDesc")}</span>
                        </Label>
                        <Label
                          htmlFor="partner"
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-accent"
                        >
                          <RadioGroupItem value="partner" id="partner" className="sr-only" />
                          <UserRound className="mb-2 size-8" />
                          <span className="font-medium">{t("adminUsers.partnerRole")}</span>
                          <span className="text-muted-foreground text-xs">{t("register.partnerRoleDesc")}</span>
                        </Label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">{t("register.continue")}</Button>
            </form>
          </Form>
        )}

        {step === 2 && (
          <Form {...step2Form}>
            <form
              onSubmit={step2Form.handleSubmit(onStep2)}
              className="space-y-4"
            >
              <FormField
                control={step2Form.control}
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
                control={step2Form.control}
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={step2Form.control}
                  name="firstName"
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
                  control={step2Form.control}
                  name="lastName"
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
                control={step2Form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("register.phoneOptional")}</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+33 6 12 34 56 78" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="mt-5 flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  {t("common.back")}
                </Button>
                <Button type="submit" className="flex-1">{t("register.continue")}</Button>
              </div>
            </form>
          </Form>
        )}

        {step === 3 && (
          <Form {...step3Form}>
            <form
              onSubmit={step3Form.handleSubmit(onStep3)}
              className="space-y-4"
            >
              <FormField
                control={step3Form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("profile.address")}</FormLabel>
                    <FormControl>
                      <AddressAutocomplete
                        value={field.value}
                        onChange={field.onChange}
                        onPlaceSelect={(r) => {
                          setAddressLat(r.lat);
                          setAddressLng(r.lng);
                          step3Form.setValue("addressLat", r.lat);
                          step3Form.setValue("addressLng", r.lng);
                        }}
                        placeholder={t("register.addressPlaceholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  {t("common.back")}
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? t("register.creatingAccount") : t("register.createAccountButton")}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground w-full text-center text-sm">
          {t("register.alreadyHaveAccount")}{" "}
          <Link href="/login" className="text-primary underline">
            {t("auth.signIn")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
