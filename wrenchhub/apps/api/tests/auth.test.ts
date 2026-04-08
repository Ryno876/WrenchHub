import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/index";
import { prisma } from "../src/lib/prisma";

const TEST_EMAIL = "auth-test@example.com";

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: "auth-test" } } });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: "auth-test" } } });
  await prisma.$disconnect();
});

describe("POST /api/auth/register", () => {
  it("should register a new car owner", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: TEST_EMAIL,
      password: "password123",
      role: "car_owner",
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(TEST_EMAIL);
    expect(res.body.user.role).toBe("car_owner");
    expect(res.body.user.password).toBeUndefined();
  });

  it("should reject duplicate email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User 2",
      email: TEST_EMAIL,
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
      email: TEST_EMAIL,
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(TEST_EMAIL);
  });

  it("should reject wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: TEST_EMAIL,
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
      email: TEST_EMAIL,
      password: "password123",
    });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${loginRes.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(TEST_EMAIL);
  });

  it("should reject request without token", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
  });
});
