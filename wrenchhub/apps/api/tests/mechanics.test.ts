import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/index";
import { prisma } from "../src/lib/prisma";

const TEST_EMAIL = "mechanics-test@example.com";
let mechanicToken: string;
let mechanicUserId: string;

beforeAll(async () => {
  await prisma.mechanicProfile.deleteMany();
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });

  const res = await request(app).post("/api/auth/register").send({
    name: "Mike's Auto",
    email: TEST_EMAIL,
    password: "password123",
    role: "mechanic",
  });

  mechanicToken = res.body.token;
  mechanicUserId = res.body.user.id;
});

afterAll(async () => {
  await prisma.mechanicProfile.deleteMany();
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
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
