import { Router } from "express";
import { mechanicProfileSchema } from "@wrenchhub/shared";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// Public: browse/search mechanics
router.get("/browse", async (req, res) => {
  const { service, serviceType, location, verified, minRating } = req.query;

  const where: Record<string, unknown> = {};

  if (service) where.services = { has: service as string };
  if (serviceType && serviceType !== "all") {
    where.serviceType = { in: [serviceType as string, "both"] };
  }
  if (location) where.location = { contains: location as string, mode: "insensitive" };
  if (verified === "true") where.verified = true;

  const profiles = await prisma.mechanicProfile.findMany({
    where,
    include: {
      user: { select: { name: true, createdAt: true } },
    },
    orderBy: [
      { verified: "desc" },
      { yearsExperience: "desc" },
    ],
  });

  res.json(profiles);
});

// Authenticated: get own profile (must be before /:id)
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
    res
      .status(409)
      .json({ error: "Profile already exists. Use PUT to update." });
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

// Public: get any mechanic profile by ID (must be last)
router.get("/:id", async (req, res) => {
  const profile = await prisma.mechanicProfile.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
    },
  });

  if (!profile) {
    res.status(404).json({ error: "Mechanic not found" });
    return;
  }

  res.json(profile);
});

export default router;
