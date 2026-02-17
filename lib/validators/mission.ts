import { z } from "zod";

export const missionFormSchema = z.object({
  package_title: z.string().min(1, "Title is required"),
  package_size: z.enum(["small", "medium", "large"]),
  pickup_address: z.string().min(1, "Pickup address is required"),
  pickup_lat: z.number(),
  pickup_lng: z.number(),
  delivery_address: z.string().min(1, "Delivery address is required"),
  delivery_lat: z.number(),
  delivery_lng: z.number(),
  pickup_time_slot: z.string().min(1, "Time slot is required"),
});

export type MissionFormInput = z.infer<typeof missionFormSchema>;
