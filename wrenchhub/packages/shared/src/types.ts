export type UserRole = "car_owner" | "mechanic";

export type ServiceType = "mobile" | "shop" | "both";

export type Urgency = "flexible" | "within_a_week" | "asap";

export type JobStatus =
  | "draft"
  | "active"
  | "bidding"
  | "accepted"
  | "completed"
  | "closed";

export type BidStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export type JobCategory =
  | "maintenance"
  | "repair"
  | "diagnostics"
  | "body_work"
  | "other";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location: string | null;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  year: number;
  make: string;
  model: string;
  mileage: number;
}

export interface MechanicProfile {
  id: string;
  userId: string;
  businessName: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  serviceAreaRadius: number;
  serviceType: ServiceType;
  services: string[];
  certifications: string[];
  yearsExperience: number;
  photos: string[];
  profilePhoto: string | null;
  coverPhoto: string | null;
  verified: boolean;
  about: string;
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}
