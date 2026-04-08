# WrenchHub Phase 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the WrenchHub monorepo, database, authentication system, car owner vehicle management, and mechanic profile creation — the foundation everything else builds on.

**Architecture:** Turborepo monorepo with a Next.js web app, Express API server, and shared packages for database (Prisma) and validation (Zod). PostgreSQL for persistence, JWT for auth, Cloudflare R2 for file uploads.

**Tech Stack:** TypeScript, Next.js 15, React 19, Express, PostgreSQL, Prisma, Zod, TanStack Query, Tailwind CSS, bcrypt, jsonwebtoken

---

## File Structure

```
wrenchhub/
├── turbo.json                          # Turborepo pipeline config
├── package.json                        # Root workspace config
├── .gitignore
├── .env.example                        # Template for environment variables
├── apps/
│   ├── api/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts                # Express server entry point
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts             # Register, login, me endpoints
│   │   │   │   ├── vehicles.ts         # CRUD for car owner vehicles
│   │   │   │   └── mechanics.ts        # Mechanic profile CRUD + photo upload
│   │   │   ├── middleware/
│   │   │   │   └── auth.ts             # JWT verification middleware
│   │   │   └── lib/
│   │   │       ├── prisma.ts           # Prisma client singleton
│   │   │       └── upload.ts           # R2/S3 file upload helper
│   │   └── tests/
│   │       ├── auth.test.ts            # Auth endpoint tests
│   │       ├── vehicles.test.ts        # Vehicle endpoint tests
│   │       └── mechanics.test.ts       # Mechanic profile endpoint tests
│   └── web/
│       ├── package.json
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx          # Root layout with providers
│       │   │   ├── page.tsx            # Landing/home page
│       │   │   ├── login/
│       │   │   │   └── page.tsx        # Login page
│       │   │   ├── register/
│       │   │   │   └── page.tsx        # Register page (role selection)
│       │   │   ├── dashboard/
│       │   │   │   ├── layout.tsx      # Dashboard layout (auth-protected)
│       │   │   │   ├── page.tsx        # Dashboard home
│       │   │   │   └── vehicles/
│       │   │   │       └── page.tsx    # Vehicle management page
│       │   │   └── mechanic/
│       │   │       └── profile/
│       │   │           └── edit/
│       │   │               └── page.tsx # Mechanic profile editor
│       │   ├── components/
│       │   │   ├── Navbar.tsx          # Top navigation bar
│       │   │   ├── AuthForm.tsx        # Reusable login/register form
│       │   │   ├── VehicleCard.tsx     # Vehicle display card
│       │   │   ├── VehicleForm.tsx     # Add/edit vehicle form
│       │   │   └── MechanicProfileForm.tsx # Mechanic profile editor
│       │   └── lib/
│       │       ├── api.ts             # API client (fetch wrapper)
│       │       ├── auth.tsx           # Auth context provider + hooks
│       │       └── query.tsx          # TanStack Query provider
├── packages/
│   ├── db/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── prisma/
│   │   │   └── schema.prisma          # Database schema
│   │   └── src/
│   │       └── index.ts               # Re-exports Prisma client + types
│   └── shared/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts               # Barrel export
│           ├── types.ts               # Shared TypeScript types
│           └── validation.ts          # Zod schemas for API payloads
```

---

## Task 0: Environment Setup

**Prerequisites:** Windows 11 PC with internet access.

- [ ] **Step 1: Install Node.js**

Go to https://nodejs.org and download the **LTS** version (22.x). Run the installer with all defaults. After install, verify:

```bash
node --version
```

Expected: `v22.x.x`

- [ ] **Step 2: Install pnpm (package manager)**

```bash
npm install -g pnpm
```

Then verify:

```bash
pnpm --version
```

Expected: `10.x.x`

- [ ] **Step 3: Install PostgreSQL**

Go to https://www.postgresql.org/download/windows/ and download the installer. During install:
- Set a password for the `postgres` user (remember this!)
- Keep the default port `5432`
- Install all default components

After install, verify from a terminal:

```bash
psql -U postgres -c "SELECT version();"
```

Enter your password when prompted. Expected: shows PostgreSQL version.

- [ ] **Step 4: Create the WrenchHub database**

```bash
psql -U postgres -c "CREATE DATABASE wrenchhub;"
```

Expected: `CREATE DATABASE`

- [ ] **Step 5: Verify Git is installed**

```bash
git --version
```

Expected: `git version 2.x.x` — if not installed, download from https://git-scm.com

---

## Task 1: Monorepo Scaffold

**Files:**
- Create: `wrenchhub/package.json`
- Create: `wrenchhub/turbo.json`
- Create: `wrenchhub/pnpm-workspace.yaml`
- Create: `wrenchhub/.gitignore`
- Create: `wrenchhub/.env.example`

- [ ] **Step 1: Create the project directory and initialize**

```bash
cd "c:/APP Devolopment"
mkdir wrenchhub && cd wrenchhub
pnpm init
```

- [ ] **Step 2: Create pnpm-workspace.yaml**

Create file `wrenchhub/pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 3: Create turbo.json**

Create file `wrenchhub/turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

- [ ] **Step 4: Update root package.json**

Replace `wrenchhub/package.json` with:

```json
{
  "name": "wrenchhub",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint"
  },
  "devDependencies": {
    "turbo": "^2"
  },
  "packageManager": "pnpm@10.7.0"
}
```

- [ ] **Step 5: Create .gitignore**

Create file `wrenchhub/.gitignore`:

```
node_modules/
.next/
dist/
.env
.env.local
*.tsbuildinfo
.turbo/
.superpowers/
```

- [ ] **Step 6: Create .env.example**

Create file `wrenchhub/.env.example`:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/wrenchhub"
JWT_SECRET="change-me-to-a-random-string"
```

- [ ] **Step 7: Create app and package directories**

```bash
mkdir -p apps/api/src apps/web/src packages/db/prisma packages/db/src packages/shared/src
```

- [ ] **Step 8: Install turbo and verify**

```bash
pnpm install
pnpm turbo --version
```

Expected: turbo version prints successfully.

- [ ] **Step 9: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Turborepo monorepo"
```

---

## Task 2: Shared Package — Types & Validation

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/types.ts`
- Create: `packages/shared/src/validation.ts`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: Create packages/shared/package.json**

```json
{
  "name": "@wrenchhub/shared",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.24"
  },
  "devDependencies": {
    "typescript": "^5.7"
  }
}
```

- [ ] **Step 2: Create packages/shared/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "declaration": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create packages/shared/src/types.ts**

```typescript
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
```

- [ ] **Step 4: Create packages/shared/src/validation.ts**

```typescript
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
```

- [ ] **Step 5: Create packages/shared/src/index.ts**

```typescript
export * from "./types";
export * from "./validation";
```

- [ ] **Step 6: Install dependencies and verify**

```bash
cd packages/shared
pnpm install
pnpm lint
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
cd ../..
git add .
git commit -m "feat: add shared types and Zod validation schemas"
```

---

## Task 3: Database Package — Prisma Schema

**Files:**
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/prisma/schema.prisma`
- Create: `packages/db/src/index.ts`

- [ ] **Step 1: Create packages/db/package.json**

```json
{
  "name": "@wrenchhub/db",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@prisma/client": "^6"
  },
  "devDependencies": {
    "prisma": "^6",
    "typescript": "^5.7"
  }
}
```

- [ ] **Step 2: Create packages/db/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "declaration": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create packages/db/prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      String   // "car_owner" or "mechanic"
  location  String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  vehicles        Vehicle[]
  mechanicProfile MechanicProfile?

  @@map("users")
}

model Vehicle {
  id      String @id @default(cuid())
  ownerId String @map("owner_id")
  year    Int
  make    String
  model   String
  mileage Int

  owner User @relation(fields: [ownerId], references: [id], onDelete: Cascade)

  @@map("vehicles")
}

model MechanicProfile {
  id                String   @id @default(cuid())
  userId            String   @unique @map("user_id")
  businessName      String   @map("business_name")
  location          String
  latitude          Float?
  longitude         Float?
  serviceAreaRadius Int      @default(15) @map("service_area_radius")
  serviceType       String   @default("shop") @map("service_type") // "mobile", "shop", "both"
  services          String[] // array of service categories
  certifications    String[] // array of certifications
  yearsExperience   Int      @default(0) @map("years_experience")
  photos            String[] // URLs to uploaded photos
  profilePhoto      String?  @map("profile_photo")
  coverPhoto        String?  @map("cover_photo")
  verified          Boolean  @default(false)
  about             String   @default("")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("mechanic_profiles")
}
```

- [ ] **Step 4: Create packages/db/src/index.ts**

```typescript
export { PrismaClient } from "@prisma/client";
export type { User, Vehicle, MechanicProfile } from "@prisma/client";
```

- [ ] **Step 5: Create .env file with your database credentials**

Create `wrenchhub/.env` (at the project root):

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/wrenchhub"
JWT_SECRET="wrenchhub-dev-secret-change-in-production"
```

Replace `YOUR_PASSWORD_HERE` with the password you set during PostgreSQL installation.

- [ ] **Step 6: Install dependencies and run the first migration**

```bash
cd packages/db
pnpm install
npx prisma generate
npx prisma migrate dev --name init
```

Expected: Migration succeeds, tables created in database.

- [ ] **Step 7: Verify tables exist**

```bash
npx prisma studio
```

This opens a browser at http://localhost:5555 showing your database tables (users, vehicles, mechanic_profiles). Close with Ctrl+C.

- [ ] **Step 8: Commit**

```bash
cd ../..
git add .
git commit -m "feat: add Prisma schema with User, Vehicle, MechanicProfile models"
```

---

## Task 4: API Server — Express Setup

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/src/index.ts`
- Create: `apps/api/src/lib/prisma.ts`

- [ ] **Step 1: Create apps/api/package.json**

```json
{
  "name": "@wrenchhub/api",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@wrenchhub/db": "workspace:*",
    "@wrenchhub/shared": "workspace:*",
    "bcryptjs": "^3",
    "cors": "^2.8",
    "dotenv": "^16",
    "express": "^5",
    "jsonwebtoken": "^9",
    "multer": "^2",
    "zod": "^3.24"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2",
    "@types/cors": "^2",
    "@types/express": "^5",
    "@types/jsonwebtoken": "^9",
    "@types/multer": "^1",
    "@types/supertest": "^6",
    "supertest": "^7",
    "tsx": "^4",
    "typescript": "^5.7",
    "vitest": "^3"
  }
}
```

- [ ] **Step 2: Create apps/api/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["tests"]
}
```

- [ ] **Step 3: Create apps/api/src/lib/prisma.ts**

```typescript
import { PrismaClient } from "@wrenchhub/db";

export const prisma = new PrismaClient();
```

- [ ] **Step 4: Create apps/api/src/index.ts**

```typescript
import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`WrenchHub API running on http://localhost:${PORT}`);
});

export { app };
```

- [ ] **Step 5: Install dependencies and start the server**

```bash
cd apps/api
pnpm install
pnpm dev
```

Expected: `WrenchHub API running on http://localhost:4000`

Open http://localhost:4000/health in your browser — you should see `{"status":"ok","timestamp":"..."}`. Stop the server with Ctrl+C.

- [ ] **Step 6: Commit**

```bash
cd ../..
git add .
git commit -m "feat: add Express API server with health check"
```

---

## Task 5: API — Auth Routes (Register & Login)

**Files:**
- Create: `apps/api/src/middleware/auth.ts`
- Create: `apps/api/src/routes/auth.ts`
- Create: `apps/api/tests/auth.test.ts`
- Modify: `apps/api/src/index.ts`

- [ ] **Step 1: Write auth tests**

Create `apps/api/tests/auth.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/index";
import { prisma } from "../src/lib/prisma";

beforeAll(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe("POST /api/auth/register", () => {
  it("should register a new car owner", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "car_owner",
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("test@example.com");
    expect(res.body.user.role).toBe("car_owner");
    expect(res.body.user.password).toBeUndefined();
  });

  it("should reject duplicate email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User 2",
      email: "test@example.com",
      password: "password123",
      role: "car_owner",
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Email already registered");
  });

  it("should reject invalid input", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "T",
      email: "not-an-email",
      password: "short",
      role: "invalid",
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

describe("POST /api/auth/login", () => {
  it("should login with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("test@example.com");
  });

  it("should reject wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });

  it("should reject non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });
});

describe("GET /api/auth/me", () => {
  it("should return current user with valid token", async () => {
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${loginRes.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("test@example.com");
  });

  it("should reject request without token", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd apps/api
pnpm test
```

Expected: all tests FAIL (routes don't exist yet).

- [ ] **Step 3: Create auth middleware**

Create `apps/api/src/middleware/auth.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}
```

- [ ] **Step 4: Create auth routes**

Create `apps/api/src/routes/auth.ts`:

```typescript
import { Router } from "express";
import bcrypt from "bcryptjs";
import { registerSchema, loginSchema } from "@wrenchhub/shared";
import { prisma } from "../lib/prisma";
import { requireAuth, signToken, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/register", async (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ errors: result.error.flatten().fieldErrors });
    return;
  }

  const { name, email, password, role, location } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role, location },
  });

  const token = signToken(user.id);

  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      createdAt: user.createdAt.toISOString(),
    },
  });
});

router.post("/login", async (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ errors: result.error.flatten().fieldErrors });
    return;
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken(user.id);

  res.status(200).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      createdAt: user.createdAt.toISOString(),
    },
  });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    location: user.location,
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
```

- [ ] **Step 5: Wire auth routes into Express**

Update `apps/api/src/index.ts`:

```typescript
import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`WrenchHub API running on http://localhost:${PORT}`);
  });
}

export { app };
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
pnpm test
```

Expected: all 7 auth tests PASS.

- [ ] **Step 7: Commit**

```bash
cd ../..
git add .
git commit -m "feat: add auth routes — register, login, me with JWT"
```

---

## Task 6: API — Vehicle Routes

**Files:**
- Create: `apps/api/src/routes/vehicles.ts`
- Create: `apps/api/tests/vehicles.test.ts`
- Modify: `apps/api/src/index.ts`

- [ ] **Step 1: Write vehicle tests**

Create `apps/api/tests/vehicles.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/index";
import { prisma } from "../src/lib/prisma";

let token: string;

beforeAll(async () => {
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  const res = await request(app).post("/api/auth/register").send({
    name: "Car Owner",
    email: "owner@example.com",
    password: "password123",
    role: "car_owner",
  });

  token = res.body.token;
});

afterAll(async () => {
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe("POST /api/vehicles", () => {
  it("should create a vehicle", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send({ year: 2021, make: "Honda", model: "Accord", mileage: 45200 });

    expect(res.status).toBe(201);
    expect(res.body.make).toBe("Honda");
    expect(res.body.model).toBe("Accord");
  });

  it("should reject invalid vehicle data", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send({ year: 1800, make: "", model: "", mileage: -100 });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/vehicles", () => {
  it("should list user vehicles", async () => {
    const res = await request(app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].make).toBe("Honda");
  });
});

describe("PUT /api/vehicles/:id", () => {
  it("should update a vehicle", async () => {
    const listRes = await request(app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${token}`);

    const vehicleId = listRes.body[0].id;

    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ year: 2021, make: "Honda", model: "Accord", mileage: 50000 });

    expect(res.status).toBe(200);
    expect(res.body.mileage).toBe(50000);
  });
});

describe("DELETE /api/vehicles/:id", () => {
  it("should delete a vehicle", async () => {
    const listRes = await request(app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${token}`);

    const vehicleId = listRes.body[0].id;

    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd apps/api && pnpm test
```

Expected: vehicle tests FAIL (routes don't exist).

- [ ] **Step 3: Create vehicle routes**

Create `apps/api/src/routes/vehicles.ts`:

```typescript
import { Router } from "express";
import { vehicleSchema } from "@wrenchhub/shared";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  const vehicles = await prisma.vehicle.findMany({
    where: { ownerId: req.userId },
    orderBy: { year: "desc" },
  });

  res.json(vehicles);
});

router.post("/", async (req: AuthRequest, res) => {
  const result = vehicleSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ errors: result.error.flatten().fieldErrors });
    return;
  }

  const vehicle = await prisma.vehicle.create({
    data: { ...result.data, ownerId: req.userId! },
  });

  res.status(201).json(vehicle);
});

router.put("/:id", async (req: AuthRequest, res) => {
  const result = vehicleSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ errors: result.error.flatten().fieldErrors });
    return;
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: req.params.id },
  });

  if (!vehicle || vehicle.ownerId !== req.userId) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }

  const updated = await prisma.vehicle.update({
    where: { id: req.params.id },
    data: result.data,
  });

  res.json(updated);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: req.params.id },
  });

  if (!vehicle || vehicle.ownerId !== req.userId) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }

  await prisma.vehicle.delete({ where: { id: req.params.id } });

  res.status(204).send();
});

export default router;
```

- [ ] **Step 4: Wire vehicle routes into Express**

Update `apps/api/src/index.ts` — add the import and route:

```typescript
import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import vehicleRoutes from "./routes/vehicles";

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`WrenchHub API running on http://localhost:${PORT}`);
  });
}

export { app };
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test
```

Expected: all vehicle tests PASS.

- [ ] **Step 6: Commit**

```bash
cd ../..
git add .
git commit -m "feat: add vehicle CRUD routes with tests"
```

---

## Task 7: API — Mechanic Profile Routes

**Files:**
- Create: `apps/api/src/routes/mechanics.ts`
- Create: `apps/api/tests/mechanics.test.ts`
- Modify: `apps/api/src/index.ts`

- [ ] **Step 1: Write mechanic profile tests**

Create `apps/api/tests/mechanics.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/index";
import { prisma } from "../src/lib/prisma";

let mechanicToken: string;
let mechanicUserId: string;

beforeAll(async () => {
  await prisma.mechanicProfile.deleteMany();
  await prisma.user.deleteMany();

  const res = await request(app).post("/api/auth/register").send({
    name: "Mike's Auto",
    email: "mike@example.com",
    password: "password123",
    role: "mechanic",
  });

  mechanicToken = res.body.token;
  mechanicUserId = res.body.user.id;
});

afterAll(async () => {
  await prisma.mechanicProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

const profileData = {
  businessName: "Mike's Auto Repair",
  location: "Fort Lauderdale, FL",
  serviceAreaRadius: 15,
  serviceType: "shop" as const,
  services: ["brakes", "engine", "diagnostics"],
  certifications: ["ASE Certified"],
  yearsExperience: 12,
  about: "Family-owned shop since 2014.",
};

describe("POST /api/mechanics/profile", () => {
  it("should create a mechanic profile", async () => {
    const res = await request(app)
      .post("/api/mechanics/profile")
      .set("Authorization", `Bearer ${mechanicToken}`)
      .send(profileData);

    expect(res.status).toBe(201);
    expect(res.body.businessName).toBe("Mike's Auto Repair");
    expect(res.body.services).toContain("brakes");
    expect(res.body.verified).toBe(false);
  });

  it("should reject duplicate profile", async () => {
    const res = await request(app)
      .post("/api/mechanics/profile")
      .set("Authorization", `Bearer ${mechanicToken}`)
      .send(profileData);

    expect(res.status).toBe(409);
  });
});

describe("GET /api/mechanics/profile", () => {
  it("should get own profile", async () => {
    const res = await request(app)
      .get("/api/mechanics/profile")
      .set("Authorization", `Bearer ${mechanicToken}`);

    expect(res.status).toBe(200);
    expect(res.body.businessName).toBe("Mike's Auto Repair");
  });
});

describe("PUT /api/mechanics/profile", () => {
  it("should update mechanic profile", async () => {
    const res = await request(app)
      .put("/api/mechanics/profile")
      .set("Authorization", `Bearer ${mechanicToken}`)
      .send({
        ...profileData,
        businessName: "Mike's Premium Auto Repair",
        serviceType: "both",
      });

    expect(res.status).toBe(200);
    expect(res.body.businessName).toBe("Mike's Premium Auto Repair");
    expect(res.body.serviceType).toBe("both");
  });
});

describe("GET /api/mechanics/:id", () => {
  it("should get a public mechanic profile", async () => {
    const profile = await prisma.mechanicProfile.findUnique({
      where: { userId: mechanicUserId },
    });

    const res = await request(app).get(`/api/mechanics/${profile!.id}`);

    expect(res.status).toBe(200);
    expect(res.body.businessName).toBe("Mike's Premium Auto Repair");
  });

  it("should return 404 for non-existent profile", async () => {
    const res = await request(app).get("/api/mechanics/nonexistent-id");

    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd apps/api && pnpm test
```

Expected: mechanic tests FAIL.

- [ ] **Step 3: Create mechanic routes**

Create `apps/api/src/routes/mechanics.ts`:

```typescript
import { Router } from "express";
import { mechanicProfileSchema } from "@wrenchhub/shared";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// Public: get any mechanic profile by ID
router.get("/:id", async (req, res) => {
  const profile = await prisma.mechanicProfile.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { name: true, email: true, createdAt: true } } },
  });

  if (!profile) {
    res.status(404).json({ error: "Mechanic not found" });
    return;
  }

  res.json(profile);
});

// Authenticated: get own profile
router.get("/profile", requireAuth, async (req: AuthRequest, res) => {
  const profile = await prisma.mechanicProfile.findUnique({
    where: { userId: req.userId },
  });

  if (!profile) {
    res.status(404).json({ error: "Profile not found. Create one first." });
    return;
  }

  res.json(profile);
});

// Authenticated: create profile
router.post("/profile", requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (user?.role !== "mechanic") {
    res.status(403).json({ error: "Only mechanics can create a profile" });
    return;
  }

  const existing = await prisma.mechanicProfile.findUnique({
    where: { userId: req.userId },
  });
  if (existing) {
    res.status(409).json({ error: "Profile already exists. Use PUT to update." });
    return;
  }

  const result = mechanicProfileSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: result.error.flatten().fieldErrors });
    return;
  }

  const profile = await prisma.mechanicProfile.create({
    data: { ...result.data, userId: req.userId! },
  });

  res.status(201).json(profile);
});

// Authenticated: update own profile
router.put("/profile", requireAuth, async (req: AuthRequest, res) => {
  const existing = await prisma.mechanicProfile.findUnique({
    where: { userId: req.userId },
  });

  if (!existing) {
    res.status(404).json({ error: "Profile not found. Create one first." });
    return;
  }

  const result = mechanicProfileSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: result.error.flatten().fieldErrors });
    return;
  }

  const profile = await prisma.mechanicProfile.update({
    where: { userId: req.userId },
    data: result.data,
  });

  res.json(profile);
});

export default router;
```

**Important:** The route order matters — `/profile` must be registered before `/:id` so Express doesn't treat "profile" as an ID. Update the router to handle this:

Replace the route definitions so the specific routes come first:

```typescript
// Move this ABOVE the /:id route
router.get("/profile", requireAuth, async (req: AuthRequest, res) => {
  // ... (same code as above)
});

router.post("/profile", requireAuth, async (req: AuthRequest, res) => {
  // ... (same code as above)
});

router.put("/profile", requireAuth, async (req: AuthRequest, res) => {
  // ... (same code as above)
});

// This MUST be last
router.get("/:id", async (req, res) => {
  // ... (same code as above)
});
```

- [ ] **Step 4: Wire mechanic routes into Express**

Update `apps/api/src/index.ts`:

```typescript
import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import vehicleRoutes from "./routes/vehicles";
import mechanicRoutes from "./routes/mechanics";

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/mechanics", mechanicRoutes);

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`WrenchHub API running on http://localhost:${PORT}`);
  });
}

export { app };
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test
```

Expected: all mechanic profile tests PASS.

- [ ] **Step 6: Commit**

```bash
cd ../..
git add .
git commit -m "feat: add mechanic profile CRUD routes with tests"
```

---

## Task 8: Next.js Web App — Setup & Tailwind

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/app/globals.css`

- [ ] **Step 1: Create apps/web/package.json**

```json
{
  "name": "@wrenchhub/web",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@wrenchhub/shared": "workspace:*",
    "@tanstack/react-query": "^5",
    "next": "^15",
    "react": "^19",
    "react-dom": "^19",
    "zustand": "^5"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "typescript": "^5.7"
  }
}
```

- [ ] **Step 2: Create apps/web/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create apps/web/next.config.ts**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@wrenchhub/shared"],
};

export default nextConfig;
```

- [ ] **Step 4: Create apps/web/postcss.config.js**

```javascript
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

- [ ] **Step 5: Create apps/web/tailwind.config.ts**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#ff6b35",
          teal: "#4ecdc4",
          dark: "#0f0f23",
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Create apps/web/src/app/globals.css**

```css
@import "tailwindcss";
```

- [ ] **Step 7: Create apps/web/src/app/layout.tsx**

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WrenchHub — The Uber for Car Repairs",
  description:
    "Post your car repair needs and get competitive bids from local mechanics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: Create apps/web/src/app/page.tsx**

```tsx
export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-dark text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold mb-4">
          <span className="text-brand-orange">Wrench</span>
          <span className="text-brand-teal">Hub</span>
        </h1>
        <p className="text-xl text-gray-400">
          Stop overpaying for car repairs.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Install dependencies and start dev server**

```bash
cd apps/web
pnpm install
pnpm dev
```

Open http://localhost:3000 — you should see the WrenchHub logo with the tagline on a dark background. Stop with Ctrl+C.

- [ ] **Step 10: Commit**

```bash
cd ../..
git add .
git commit -m "feat: add Next.js web app with Tailwind CSS"
```

---

## Task 9: Web App — API Client & Auth Context

**Files:**
- Create: `apps/web/src/lib/api.ts`
- Create: `apps/web/src/lib/auth.tsx`
- Create: `apps/web/src/lib/query.tsx`
- Modify: `apps/web/src/app/layout.tsx`

- [ ] **Step 1: Create apps/web/src/lib/api.ts**

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}
```

- [ ] **Step 2: Create apps/web/src/lib/auth.tsx**

```tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { apiFetch } from "./api";
import type { PublicUser, AuthResponse } from "@wrenchhub/shared";

interface AuthState {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "car_owner" | "mechanic"
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    apiFetch<PublicUser>("/api/auth/me")
      .then(setUser)
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: "car_owner" | "mechanic"
  ) => {
    const data = await apiFetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

- [ ] **Step 3: Create apps/web/src/lib/query.tsx**

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

- [ ] **Step 4: Update layout.tsx to include providers**

Replace `apps/web/src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { QueryProvider } from "@/lib/query";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WrenchHub — The Uber for Car Repairs",
  description:
    "Post your car repair needs and get competitive bids from local mechanics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Verify it compiles**

```bash
cd apps/web && pnpm dev
```

Open http://localhost:3000 — page should still load with no errors. Check the browser console for errors. Stop with Ctrl+C.

- [ ] **Step 6: Commit**

```bash
cd ../..
git add .
git commit -m "feat: add API client, auth context, and query provider"
```

---

## Task 10: Web App — Navbar Component

**Files:**
- Create: `apps/web/src/components/Navbar.tsx`
- Modify: `apps/web/src/app/layout.tsx`

- [ ] **Step 1: Create apps/web/src/components/Navbar.tsx**

```tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="bg-brand-dark text-white px-6 py-3 flex items-center justify-between">
      <Link href="/" className="text-xl font-extrabold">
        <span className="text-brand-orange">Wrench</span>
        <span className="text-brand-teal">Hub</span>
      </Link>

      <div className="flex items-center gap-6 text-sm">
        {loading ? null : user ? (
          <>
            <Link href="/dashboard" className="hover:text-gray-300">
              Dashboard
            </Link>
            {user.role === "car_owner" && (
              <Link href="/dashboard/vehicles" className="hover:text-gray-300">
                My Vehicles
              </Link>
            )}
            {user.role === "mechanic" && (
              <Link
                href="/mechanic/profile/edit"
                className="hover:text-gray-300"
              >
                My Profile
              </Link>
            )}
            <button
              onClick={logout}
              className="text-gray-400 hover:text-white"
            >
              Sign Out
            </button>
            <span className="bg-brand-orange text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </span>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:text-gray-300">
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-brand-orange px-4 py-2 rounded-lg font-semibold hover:opacity-90"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Add Navbar to layout**

Update `apps/web/src/app/layout.tsx` — add the Navbar inside the providers:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { QueryProvider } from "@/lib/query";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WrenchHub — The Uber for Car Repairs",
  description:
    "Post your car repair needs and get competitive bids from local mechanics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify**

```bash
cd apps/web && pnpm dev
```

Open http://localhost:3000 — navbar should appear with WrenchHub logo, Sign In, and Get Started button.

- [ ] **Step 4: Commit**

```bash
cd ../..
git add .
git commit -m "feat: add Navbar component with auth-aware navigation"
```

---

## Task 11: Web App — Register & Login Pages

**Files:**
- Create: `apps/web/src/components/AuthForm.tsx`
- Create: `apps/web/src/app/register/page.tsx`
- Create: `apps/web/src/app/login/page.tsx`

- [ ] **Step 1: Create AuthForm component**

Create `apps/web/src/components/AuthForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import type { UserRole } from "@wrenchhub/shared";

interface Props {
  mode: "login" | "register";
}

export function AuthForm({ mode }: Props) {
  const { login, register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("car_owner");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {mode === "register" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-orange focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              I am a...
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole("car_owner")}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold border-2 transition ${
                  role === "car_owner"
                    ? "border-brand-orange bg-orange-50 text-brand-orange"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                Car Owner
              </button>
              <button
                type="button"
                onClick={() => setRole("mechanic")}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold border-2 transition ${
                  role === "mechanic"
                    ? "border-brand-teal bg-teal-50 text-brand-teal"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                Mechanic
              </button>
            </div>
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-orange focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-orange focus:outline-none"
          required
          minLength={8}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-orange text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
      >
        {loading
          ? "Please wait..."
          : mode === "register"
            ? "Create Account"
            : "Sign In"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Create register page**

Create `apps/web/src/app/register/page.tsx`:

```tsx
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">
          Join WrenchHub
        </h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          Create your free account
        </p>
        <AuthForm mode="register" />
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-orange font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create login page**

Create `apps/web/src/app/login/page.tsx`:

```tsx
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          Sign in to your WrenchHub account
        </p>
        <AuthForm mode="login" />
        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brand-orange font-semibold">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Test the full flow**

Start both servers (in two separate terminals):

Terminal 1:
```bash
cd apps/api && pnpm dev
```

Terminal 2:
```bash
cd apps/web && pnpm dev
```

1. Open http://localhost:3000/register
2. Select "Car Owner", fill in name/email/password, click Create Account
3. Should redirect to /dashboard (404 for now — that's expected)
4. Refresh — navbar should show your initials instead of Sign In

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add register and login pages with auth flow"
```

---

## Task 12: Web App — Dashboard & Vehicle Management

**Files:**
- Create: `apps/web/src/app/dashboard/layout.tsx`
- Create: `apps/web/src/app/dashboard/page.tsx`
- Create: `apps/web/src/app/dashboard/vehicles/page.tsx`
- Create: `apps/web/src/components/VehicleCard.tsx`
- Create: `apps/web/src/components/VehicleForm.tsx`

- [ ] **Step 1: Create dashboard layout (auth-protected)**

Create `apps/web/src/app/dashboard/layout.tsx`:

```tsx
"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
```

- [ ] **Step 2: Create dashboard home page**

Create `apps/web/src/app/dashboard/page.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">
        Welcome, {user?.name?.split(" ")[0]}!
      </h1>
      <p className="text-gray-500 mb-8">
        {user?.role === "car_owner"
          ? "Manage your vehicles and find mechanics."
          : "Manage your profile and find jobs."}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {user?.role === "car_owner" && (
          <>
            <Link
              href="/dashboard/vehicles"
              className="bg-white rounded-xl border p-6 hover:shadow-md transition"
            >
              <h3 className="font-bold text-lg mb-1">My Vehicles</h3>
              <p className="text-sm text-gray-500">
                Add and manage your cars
              </p>
            </Link>
            <div className="bg-white rounded-xl border p-6 opacity-50">
              <h3 className="font-bold text-lg mb-1">Post a Job</h3>
              <p className="text-sm text-gray-500">Coming in Phase 2</p>
            </div>
          </>
        )}

        {user?.role === "mechanic" && (
          <>
            <Link
              href="/mechanic/profile/edit"
              className="bg-white rounded-xl border p-6 hover:shadow-md transition"
            >
              <h3 className="font-bold text-lg mb-1">My Profile</h3>
              <p className="text-sm text-gray-500">
                Set up your mechanic profile
              </p>
            </Link>
            <div className="bg-white rounded-xl border p-6 opacity-50">
              <h3 className="font-bold text-lg mb-1">Job Feed</h3>
              <p className="text-sm text-gray-500">Coming in Phase 2</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create VehicleCard component**

Create `apps/web/src/components/VehicleCard.tsx`:

```tsx
"use client";

import type { Vehicle } from "@wrenchhub/shared";

interface Props {
  vehicle: Vehicle;
  onDelete: (id: string) => void;
}

export function VehicleCard({ vehicle, onDelete }: Props) {
  return (
    <div className="bg-white rounded-xl border p-5 flex items-center justify-between">
      <div>
        <h3 className="font-bold text-lg">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>
        <p className="text-sm text-gray-500">
          {vehicle.mileage.toLocaleString()} miles
        </p>
      </div>
      <button
        onClick={() => onDelete(vehicle.id)}
        className="text-red-500 text-sm hover:text-red-700"
      >
        Remove
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Create VehicleForm component**

Create `apps/web/src/components/VehicleForm.tsx`:

```tsx
"use client";

import { useState } from "react";

interface Props {
  onSubmit: (data: {
    year: number;
    make: string;
    model: string;
    mileage: number;
  }) => Promise<void>;
  onCancel: () => void;
}

export function VehicleForm({ onSubmit, onCancel }: Props) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [mileage, setMileage] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ year, make, model, mileage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border p-5 space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mileage
          </label>
          <input
            type="number"
            value={mileage}
            onChange={(e) => setMileage(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Make
          </label>
          <input
            type="text"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="Honda"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Accord"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-orange text-white px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add Vehicle"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border px-6 py-2 rounded-lg text-sm text-gray-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 5: Create vehicles page**

Create `apps/web/src/app/dashboard/vehicles/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { VehicleCard } from "@/components/VehicleCard";
import { VehicleForm } from "@/components/VehicleForm";
import type { Vehicle } from "@wrenchhub/shared";

export default function VehiclesPage() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => apiFetch<Vehicle[]>("/api/vehicles"),
  });

  const addVehicle = useMutation({
    mutationFn: (data: {
      year: number;
      make: string;
      model: string;
      mileage: number;
    }) =>
      apiFetch<Vehicle>("/api/vehicles", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setShowForm(false);
    },
  });

  const deleteVehicle = useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/vehicles/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-gray-500">Loading vehicles...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Vehicles</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-brand-orange text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            + Add Vehicle
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <VehicleForm
            onSubmit={async (data) => {
              await addVehicle.mutateAsync(data);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">No vehicles yet</p>
          <p className="text-sm">
            Add your first vehicle to get started posting jobs.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              onDelete={(id) => deleteVehicle.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Test the full flow**

With both servers running:
1. Register as a car owner
2. Go to /dashboard — see "My Vehicles" card
3. Click it — go to /dashboard/vehicles
4. Click "+ Add Vehicle" — fill in year, make, model, mileage
5. Submit — vehicle appears in the list
6. Click "Remove" — vehicle is deleted

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add dashboard and vehicle management pages"
```

---

## Task 13: Web App — Mechanic Profile Editor

**Files:**
- Create: `apps/web/src/components/MechanicProfileForm.tsx`
- Create: `apps/web/src/app/mechanic/profile/edit/page.tsx`

- [ ] **Step 1: Create MechanicProfileForm component**

Create `apps/web/src/components/MechanicProfileForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { MechanicProfile, ServiceType } from "@wrenchhub/shared";

const SERVICE_OPTIONS = [
  "Oil Change",
  "Brakes & Rotors",
  "Engine Repair",
  "Transmission",
  "Diagnostics",
  "Electrical",
  "A/C Service",
  "Suspension",
  "Exhaust",
  "Tire Service",
  "Body Work",
  "Paint",
];

interface Props {
  initialData?: MechanicProfile;
  onSubmit: (data: {
    businessName: string;
    location: string;
    serviceAreaRadius: number;
    serviceType: ServiceType;
    services: string[];
    certifications: string[];
    yearsExperience: number;
    about: string;
  }) => Promise<void>;
}

export function MechanicProfileForm({ initialData, onSubmit }: Props) {
  const [businessName, setBusinessName] = useState(
    initialData?.businessName || ""
  );
  const [location, setLocation] = useState(initialData?.location || "");
  const [serviceAreaRadius, setServiceAreaRadius] = useState(
    initialData?.serviceAreaRadius || 15
  );
  const [serviceType, setServiceType] = useState<ServiceType>(
    (initialData?.serviceType as ServiceType) || "shop"
  );
  const [services, setServices] = useState<string[]>(
    initialData?.services || []
  );
  const [certifications, setCertifications] = useState(
    initialData?.certifications?.join(", ") || ""
  );
  const [yearsExperience, setYearsExperience] = useState(
    initialData?.yearsExperience || 0
  );
  const [about, setAbout] = useState(initialData?.about || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleService = (s: string) => {
    setServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit({
        businessName,
        location,
        serviceAreaRadius,
        serviceType,
        services,
        certifications: certifications
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        yearsExperience,
        about,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Name
        </label>
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-sm"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Fort Lauderdale, FL"
            className="w-full border rounded-lg px-4 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Radius (miles)
          </label>
          <input
            type="number"
            value={serviceAreaRadius}
            onChange={(e) => setServiceAreaRadius(Number(e.target.value))}
            className="w-full border rounded-lg px-4 py-2 text-sm"
            min={1}
            max={100}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Type
        </label>
        <div className="flex gap-3">
          {(["shop", "mobile", "both"] as ServiceType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setServiceType(type)}
              className={`flex-1 py-3 rounded-lg text-sm font-semibold border-2 capitalize transition ${
                serviceType === type
                  ? "border-brand-teal bg-teal-50 text-brand-teal"
                  : "border-gray-200 text-gray-500"
              }`}
            >
              {type === "both" ? "Both" : type === "mobile" ? "Mobile" : "Shop"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Services Offered
        </label>
        <div className="flex flex-wrap gap-2">
          {SERVICE_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleService(s)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                services.includes(s)
                  ? "bg-brand-teal text-white border-brand-teal"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Years of Experience
          </label>
          <input
            type="number"
            value={yearsExperience}
            onChange={(e) => setYearsExperience(Number(e.target.value))}
            className="w-full border rounded-lg px-4 py-2 text-sm"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Certifications (comma-separated)
          </label>
          <input
            type="text"
            value={certifications}
            onChange={(e) => setCertifications(e.target.value)}
            placeholder="ASE Certified, Honda Specialist"
            className="w-full border rounded-lg px-4 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          About Your Business
        </label>
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          rows={4}
          className="w-full border rounded-lg px-4 py-2 text-sm"
          maxLength={1000}
          placeholder="Tell car owners about your shop, experience, and what makes you different..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-orange text-white py-3 rounded-lg font-semibold disabled:opacity-50"
      >
        {loading ? "Saving..." : initialData ? "Update Profile" : "Create Profile"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Create mechanic profile edit page**

Create `apps/web/src/app/mechanic/profile/edit/page.tsx`:

```tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { MechanicProfileForm } from "@/components/MechanicProfileForm";
import type { MechanicProfile, MechanicProfileInput } from "@wrenchhub/shared";

export default function MechanicProfileEditPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "mechanic")) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["mechanic-profile"],
    queryFn: () =>
      apiFetch<MechanicProfile>("/api/mechanics/profile").catch(() => null),
    enabled: !!user,
  });

  const saveProfile = useMutation({
    mutationFn: (data: MechanicProfileInput) =>
      apiFetch<MechanicProfile>(
        "/api/mechanics/profile",
        {
          method: profile ? "PUT" : "POST",
          body: JSON.stringify(data),
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanic-profile"] });
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">
          {profile ? "Edit Your Profile" : "Set Up Your Profile"}
        </h1>
        <div className="bg-white rounded-2xl border p-6">
          <MechanicProfileForm
            initialData={profile || undefined}
            onSubmit={async (data) => {
              await saveProfile.mutateAsync(data);
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Test the flow**

With both servers running:
1. Register as a mechanic
2. Go to /dashboard — see "My Profile" card
3. Click it — go to /mechanic/profile/edit
4. Fill in business name, location, select services, etc.
5. Click "Create Profile" — profile saves
6. Refresh — form shows saved data with "Update Profile" button

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add mechanic profile creation and editing"
```

---

## Plan Summary

| Task | What it builds | Key files |
|------|---------------|-----------|
| 0 | Environment setup | Node.js, pnpm, PostgreSQL |
| 1 | Monorepo scaffold | turbo.json, pnpm-workspace.yaml |
| 2 | Shared types & validation | packages/shared/ |
| 3 | Database schema | packages/db/prisma/schema.prisma |
| 4 | Express API server | apps/api/src/index.ts |
| 5 | Auth (register/login/me) | apps/api/src/routes/auth.ts |
| 6 | Vehicle CRUD | apps/api/src/routes/vehicles.ts |
| 7 | Mechanic profile CRUD | apps/api/src/routes/mechanics.ts |
| 8 | Next.js + Tailwind setup | apps/web/ |
| 9 | API client + auth context | apps/web/src/lib/ |
| 10 | Navbar component | apps/web/src/components/Navbar.tsx |
| 11 | Register & login pages | apps/web/src/app/login/, register/ |
| 12 | Dashboard + vehicles UI | apps/web/src/app/dashboard/ |
| 13 | Mechanic profile editor | apps/web/src/app/mechanic/ |

**After this plan is complete, you'll have:**
- Working auth system (register, login, JWT)
- Car owners can manage their vehicles
- Mechanics can create and edit their profiles
- All backed by PostgreSQL with Prisma ORM
- Full test coverage on the API

**Next plans:**
- **Phase 2 plan:** Job posting, AI-assisted descriptions, bidding system, browse mechanics directory
- **Phase 3 plan:** Messaging, reviews, verification badges
