import { Router } from "express";
import { bidSchema } from "@wrenchhub/shared";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { sendBidNotificationEmail } from "../lib/email";

const router = Router();

router.use(requireAuth);

// Get my bids (mechanic)
router.get("/mine", async (req: AuthRequest, res) => {
  const bids = await prisma.bid.findMany({
    where: { mechanicId: req.userId },
    include: {
      job: {
        include: {
          vehicle: { select: { year: true, make: true, model: true, mileage: true } },
          owner: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(bids);
});

// Submit a bid
router.post("/", async (req: AuthRequest, res) => {
  const result = bidSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ errors: result.error.flatten().fieldErrors });
    return;
  }

  // Verify user is a mechanic with a profile
  const profile = await prisma.mechanicProfile.findUnique({
    where: { userId: req.userId },
  });

  if (!profile) {
    res.status(403).json({ error: "You must create a mechanic profile first" });
    return;
  }

  // Verify job exists and is open
  const job = await prisma.job.findUnique({ where: { id: result.data.jobId } });
  if (!job || !["active", "bidding"].includes(job.status)) {
    res.status(400).json({ error: "Job is not accepting bids" });
    return;
  }

  // Check for existing bid
  const existing = await prisma.bid.findUnique({
    where: {
      jobId_mechanicId: { jobId: result.data.jobId, mechanicId: req.userId! },
    },
  });

  if (existing) {
    res.status(409).json({ error: "You already bid on this job" });
    return;
  }

  const bid = await prisma.bid.create({
    data: {
      ...result.data,
      mechanicId: req.userId!,
      mechanicProfileId: profile.id,
    },
  });

  // Update job status to bidding if it was active
  if (job.status === "active") {
    await prisma.job.update({ where: { id: job.id }, data: { status: "bidding" } });
  }

  // Notify car owner about new bid
  const jobOwner = await prisma.user.findUnique({ where: { id: job.ownerId } });
  if (jobOwner) {
    sendBidNotificationEmail(jobOwner.email, job.title, profile.businessName, bid.totalPrice);
  }

  res.status(201).json(bid);
});

// Update a bid
router.put("/:id", async (req: AuthRequest, res) => {
  const bid = await prisma.bid.findUnique({ where: { id: req.params.id } });

  if (!bid || bid.mechanicId !== req.userId) {
    res.status(404).json({ error: "Bid not found" });
    return;
  }

  if (bid.status !== "pending") {
    res.status(400).json({ error: "Cannot update a non-pending bid" });
    return;
  }

  const result = bidSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: result.error.flatten().fieldErrors });
    return;
  }

  const updated = await prisma.bid.update({
    where: { id: req.params.id },
    data: {
      totalPrice: result.data.totalPrice,
      partsBreakdown: result.data.partsBreakdown,
      laborHours: result.data.laborHours,
      laborRate: result.data.laborRate,
      fees: result.data.fees,
      estimatedCompletionTime: result.data.estimatedCompletionTime,
      notes: result.data.notes,
      availability: result.data.availability,
    },
  });

  res.json(updated);
});

// Withdraw a bid
router.delete("/:id", async (req: AuthRequest, res) => {
  const bid = await prisma.bid.findUnique({ where: { id: req.params.id } });

  if (!bid || bid.mechanicId !== req.userId) {
    res.status(404).json({ error: "Bid not found" });
    return;
  }

  if (bid.status !== "pending") {
    res.status(400).json({ error: "Cannot withdraw a non-pending bid" });
    return;
  }

  await prisma.bid.update({
    where: { id: req.params.id },
    data: { status: "withdrawn" },
  });

  res.status(204).send();
});

export default router;
