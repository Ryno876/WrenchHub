import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "./auth";

export async function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
  });

  if (!user || !user.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  next();
}
