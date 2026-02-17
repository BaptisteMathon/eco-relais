import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerStep1Schema = z.object({
  role: z.enum(["client", "partner"]),
});

export const registerStep2Schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
});

export const registerStep3Schema = z.object({
  address: z.string().min(1, "Address is required"),
  addressLat: z.number(),
  addressLng: z.number(),
});

export const registerSchema = registerStep2Schema
  .merge(registerStep3Schema)
  .and(registerStep1Schema);

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterStep1Input = z.infer<typeof registerStep1Schema>;
export type RegisterStep2Input = z.infer<typeof registerStep2Schema>;
export type RegisterStep3Input = z.infer<typeof registerStep3Schema>;
export type RegisterInput = z.infer<typeof registerSchema>;
