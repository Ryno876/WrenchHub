import { Router } from "express";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { sendPasswordResetEmail } from "../lib/email";

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "https://thewrenchhub.com";

// Request password reset
router.post("/request", async (req: any, res: any) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success (don't reveal if email exists)
  if (!user) {
    res.json({ message: "If that email exists, we sent a reset link." });
    return;
  }

  // Delete any existing reset tokens for this user
  await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

  // Create reset token (expires in 1 hour)
  const token = randomUUID();
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  await sendPasswordResetEmail(email, resetUrl);

  res.json({ message: "If that email exists, we sent a reset link." });
});

// Verify token is valid
router.get("/verify/:token", async (req: any, res: any) => {
  const reset = await prisma.passwordReset.findUnique({
    where: { token: req.params.token },
  });

  if (!reset || reset.used || reset.expiresAt < new Date()) {
    res.status(400).json({ error: "Invalid or expired reset link" });
    return;
  }

  res.json({ valid: true });
});

// Reset password with token
router.post("/reset", async (req: any, res: any) => {
  const { token, password } = req.body;

  if (!token || !password) {
    res.status(400).json({ error: "Token and password are required" });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  const reset = await prisma.passwordReset.findUnique({
    where: { token },
  });

  if (!reset || reset.used || reset.expiresAt < new Date()) {
    res.status(400).json({ error: "Invalid or expired reset link" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordReset.update({
      where: { id: reset.id },
      data: { used: true },
    }),
  ]);

  res.json({ message: "Password reset successfully" });
});

export default router;
