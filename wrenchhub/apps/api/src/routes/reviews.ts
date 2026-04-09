import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// Public: get reviews for a mechanic profile
router.get("/mechanic/:profileId", async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { mechanicProfileId: req.params.profileId },
    include: {
      reviewer: { select: { name: true } },
      job: { select: { title: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate average rating
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  res.json({ reviews, avgRating, totalReviews: reviews.length });
});

// Authenticated: leave a review
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { jobId, mechanicProfileId, rating, text } = req.body;

  if (!jobId || !mechanicProfileId || !rating || !text) {
    res.status(400).json({ error: "jobId, mechanicProfileId, rating, and text are required" });
    return;
  }

  if (rating < 1 || rating > 5) {
    res.status(400).json({ error: "Rating must be between 1 and 5" });
    return;
  }

  // Verify the job belongs to this user and has an accepted bid from this mechanic
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      bids: { where: { mechanicProfileId, status: "accepted" } },
    },
  });

  if (!job || job.ownerId !== req.userId) {
    res.status(403).json({ error: "You can only review jobs you posted" });
    return;
  }

  if (job.bids.length === 0) {
    res.status(400).json({ error: "Can only review a mechanic whose bid was accepted" });
    return;
  }

  // Check for existing review
  const existing = await prisma.review.findUnique({
    where: { jobId_reviewerId: { jobId, reviewerId: req.userId! } },
  });

  if (existing) {
    res.status(409).json({ error: "You already reviewed this job" });
    return;
  }

  const review = await prisma.review.create({
    data: {
      jobId,
      mechanicProfileId,
      reviewerId: req.userId!,
      rating,
      text,
    },
    include: {
      reviewer: { select: { name: true } },
    },
  });

  res.status(201).json(review);
});

// Authenticated: mechanic responds to a review
router.post("/:id/respond", requireAuth, async (req: AuthRequest, res) => {
  const { response } = req.body;

  if (!response || !response.trim()) {
    res.status(400).json({ error: "Response text is required" });
    return;
  }

  const review = await prisma.review.findUnique({
    where: { id: req.params.id },
    include: { mechanicProfile: true },
  });

  if (!review || review.mechanicProfile.userId !== req.userId) {
    res.status(403).json({ error: "You can only respond to your own reviews" });
    return;
  }

  const updated = await prisma.review.update({
    where: { id: req.params.id },
    data: { mechanicResponse: response.trim() },
  });

  res.json(updated);
});

export default router;
