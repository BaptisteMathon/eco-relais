import { z } from "zod";

export const profileSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    phone: z.string().optional(),
    address: z.string().optional(),
    address_lat: z.number().optional(),
    address_lng: z.number().optional(),
    password: z.string().min(6).optional().or(z.literal("")),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ProfileFormInput = z.infer<typeof profileSchema>;
