import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["car_owner", "mechanic"]),
  location: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const vehicleSchema = z.object({
  year: z
    .number()
    .int()
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  mileage: z.number().int().min(0, "Mileage cannot be negative"),
});

export const mechanicProfileSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  location: z.string().min(2, "Location is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  serviceAreaRadius: z
    .number()
    .min(1, "Service area must be at least 1 mile")
    .max(100, "Service area cannot exceed 100 miles"),
  serviceType: z.enum(["mobile", "shop", "both"]),
  services: z
    .array(z.string())
    .min(1, "Select at least one service"),
  certifications: z.array(z.string()).default([]),
  yearsExperience: z
    .number()
    .int()
    .min(0, "Years of experience cannot be negative"),
  about: z.string().max(1000, "About must be under 1000 characters").default(""),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type MechanicProfileInput = z.infer<typeof mechanicProfileSchema>;
