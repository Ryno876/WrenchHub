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
