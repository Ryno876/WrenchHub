import { Router } from "express";
import { jobSchema } from "@wrenchhub/shared";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// Public: list active jobs (for mechanic feed)
router.get("/", async (req, res) => {
  const { category, urgency, serviceType, location } = req.query;

  const where: Record<string, unknown> = {
    status: { in: ["active", "bidding"] },
  };

  if (category) where.category = category;
  if (urgency) where.urgency = urgency;
  if (serviceType && serviceType !== "no_preference") {
    where.serviceTypePreference = { in: [serviceType, "no_preference"] };
  }
  if (location) where.location = { contains: location as string, mode: "insensitive" };

  const jobs = await prisma.job.findMany({
    where,
    include: {
      vehicle: { select: { year: true, make: true, model: true, mileage: true } },
      owner: { select: { name: true } },
      _count: { select: { bids: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(jobs);
});

// Authenticated: get my posted jobs (car owner)
router.get("/mine", requireAuth, async (req: AuthRequest, res) => {
  const jobs = await prisma.job.findMany({
    where: { ownerId: req.userId },
    include: {
      vehicle: { select: { year: true, make: true, model: true, mileage: true } },
      _count: { select: { bids: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(jobs);
});

// Authenticated: get single job with bids (for job owner)
router.get("/:id", async (req, res) => {
  const job = await prisma.job.findUnique({
    where: { id: req.params.id },
    include: {
      vehicle: true,
      owner: { select: { name: true, location: true } },
      bids: {
        include: {
          mechanicProfile: {
            select: {
              id: true,
              businessName: true,
              profilePhoto: true,
              verified: true,
              serviceType: true,
              location: true,
            },
          },
          mechanic: { select: { name: true } },
        },
        orderBy: { totalPrice: "asc" },
      },
      _count: { select: { bids: true } },
    },
  });

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(job);
});

// Authenticated: create a job
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const result = jobSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ errors: result.error.flatten().fieldErrors });
    return;
  }

  // Verify vehicle belongs to user
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: result.data.vehicleId },
  });

  if (!vehicle || vehicle.ownerId !== req.userId) {
    res.status(400).json({ error: "Vehicle not found" });
    return;
  }

  const job = await prisma.job.create({
    data: {
      ...result.data,
      ownerId: req.userId!,
    },
    include: {
      vehicle: { select: { year: true, make: true, model: true, mileage: true } },
    },
  });

  res.status(201).json(job);
});

// Authenticated: update job status (accept bid, complete, close)
router.patch("/:id/status", requireAuth, async (req: AuthRequest, res) => {
  const { status } = req.body;

  const job = await prisma.job.findUnique({ where: { id: req.params.id } });

  if (!job || job.ownerId !== req.userId) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const updated = await prisma.job.update({
    where: { id: req.params.id },
    data: { status },
  });

  res.json(updated);
});

// Authenticated: accept a bid
router.post("/:id/accept-bid", requireAuth, async (req: AuthRequest, res) => {
  const { bidId } = req.body;

  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job || job.ownerId !== req.userId) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const bid = await prisma.bid.findUnique({ where: { id: bidId } });
  if (!bid || bid.jobId !== job.id) {
    res.status(400).json({ error: "Bid not found for this job" });
    return;
  }

  // Accept this bid, reject all others
  await prisma.$transaction([
    prisma.bid.update({ where: { id: bidId }, data: { status: "accepted" } }),
    prisma.bid.updateMany({
      where: { jobId: job.id, id: { not: bidId } },
      data: { status: "rejected" },
    }),
    prisma.job.update({ where: { id: job.id }, data: { status: "accepted" } }),
  ]);

  const updated = await prisma.job.findUnique({
    where: { id: job.id },
    include: {
      bids: {
        include: {
          mechanicProfile: {
            select: { id: true, businessName: true, verified: true },
          },
        },
      },
    },
  });

  res.json(updated);
});

export default router;
