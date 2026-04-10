import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

// Dashboard stats
router.get("/stats", async (_req: any, res: any) => {
  const [
    totalUsers,
    totalCarOwners,
    totalMechanics,
    totalJobs,
    activeJobs,
    totalBids,
    totalReviews,
    verifiedMechanics,
    totalConversations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "car_owner" } }),
    prisma.user.count({ where: { role: "mechanic" } }),
    prisma.job.count(),
    prisma.job.count({ where: { status: { in: ["active", "bidding"] } } }),
    prisma.bid.count(),
    prisma.review.count(),
    prisma.mechanicProfile.count({ where: { verified: true } }),
    prisma.conversation.count(),
  ]);

  const recentJobs = await prisma.job.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { name: true, email: true } },
      vehicle: { select: { year: true, make: true, model: true } },
      _count: { select: { bids: true } },
    },
  });

  const recentUsers = await prisma.user.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  res.json({
    stats: {
      totalUsers,
      totalCarOwners,
      totalMechanics,
      totalJobs,
      activeJobs,
      totalBids,
      totalReviews,
      verifiedMechanics,
      totalConversations,
    },
    recentJobs,
    recentUsers,
  });
});

// List all users
router.get("/users", async (req: any, res: any) => {
  const { role, search } = req.query;

  const where: any = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: "insensitive" } },
      { email: { contains: search as string, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isAdmin: true,
      location: true,
      createdAt: true,
      _count: {
        select: {
          jobs: true,
          bids: true,
          vehicles: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(users);
});

// List all mechanics with profiles
router.get("/mechanics", async (_req: any, res: any) => {
  const mechanics = await prisma.mechanicProfile.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, createdAt: true } },
      _count: { select: { bids: true, reviews: true } },
    },
    orderBy: { user: { createdAt: "desc" } },
  });

  res.json(mechanics);
});

// Verify/unverify a mechanic
router.patch("/mechanics/:profileId/verify", async (req: any, res: any) => {
  const { verified } = req.body;

  const profile = await prisma.mechanicProfile.findUnique({
    where: { id: req.params.profileId },
  });

  if (!profile) {
    res.status(404).json({ error: "Mechanic profile not found" });
    return;
  }

  const updated = await prisma.mechanicProfile.update({
    where: { id: req.params.profileId },
    data: { verified: verified === true },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  res.json(updated);
});

// List all jobs
router.get("/jobs", async (req: any, res: any) => {
  const { status } = req.query;

  const where: any = {};
  if (status) where.status = status;

  const jobs = await prisma.job.findMany({
    where,
    include: {
      owner: { select: { name: true, email: true } },
      vehicle: { select: { year: true, make: true, model: true } },
      _count: { select: { bids: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(jobs);
});

// Delete a user
router.delete("/users/:id", async (req: any, res: any) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  if (user.isAdmin) {
    res.status(400).json({ error: "Cannot delete an admin user" });
    return;
  }

  await prisma.user.delete({ where: { id: req.params.id } });

  res.status(204).send();
});

// Make/remove admin
router.patch("/users/:id/admin", async (req: any, res: any) => {
  const { isAdmin } = req.body;

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { isAdmin: isAdmin === true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isAdmin: true,
    },
  });

  res.json(updated);
});

export default router;
