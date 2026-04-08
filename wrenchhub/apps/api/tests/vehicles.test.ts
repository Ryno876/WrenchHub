import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/index";
import { prisma } from "../src/lib/prisma";

const TEST_EMAIL = "vehicles-test@example.com";
let token: string;

beforeAll(async () => {
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });

  const res = await request(app).post("/api/auth/register").send({
    name: "Car Owner",
    email: TEST_EMAIL,
    password: "password123",
    role: "car_owner",
  });

  token = res.body.token;
});

afterAll(async () => {
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
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
