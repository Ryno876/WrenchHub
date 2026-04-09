import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

// Get all my conversations
router.get("/", async (req: AuthRequest, res) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId: req.userId } },
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, role: true } },
        },
      },
      job: { select: { id: true, title: true } },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { text: true, createdAt: true, senderId: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Add unread count for each conversation
  const result = await Promise.all(
    conversations.map(async (conv) => {
      const myParticipant = conv.participants.find((p) => p.userId === req.userId);
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: req.userId },
          createdAt: { gt: myParticipant?.lastReadAt || new Date(0) },
        },
      });
      return { ...conv, unreadCount };
    })
  );

  res.json(result);
});

// Get or create a conversation with a user (optionally tied to a job)
router.post("/", async (req: AuthRequest, res) => {
  const { recipientId, jobId } = req.body;

  if (!recipientId) {
    res.status(400).json({ error: "recipientId is required" });
    return;
  }

  // Check if conversation already exists between these users for this job
  const existing = await prisma.conversation.findFirst({
    where: {
      jobId: jobId || null,
      AND: [
        { participants: { some: { userId: req.userId } } },
        { participants: { some: { userId: recipientId } } },
      ],
    },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, role: true } } },
      },
      job: { select: { id: true, title: true } },
    },
  });

  if (existing) {
    res.json(existing);
    return;
  }

  const conversation = await prisma.conversation.create({
    data: {
      jobId: jobId || null,
      participants: {
        create: [
          { userId: req.userId! },
          { userId: recipientId },
        ],
      },
    },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, role: true } } },
      },
      job: { select: { id: true, title: true } },
    },
  });

  res.status(201).json(conversation);
});

// Get messages for a conversation
router.get("/:id/messages", async (req: AuthRequest, res) => {
  // Verify user is a participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId: req.params.id,
        userId: req.userId!,
      },
    },
  });

  if (!participant) {
    res.status(403).json({ error: "Not a participant in this conversation" });
    return;
  }

  // Mark as read
  await prisma.conversationParticipant.update({
    where: { id: participant.id },
    data: { lastReadAt: new Date() },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId: req.params.id },
    include: {
      sender: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  res.json(messages);
});

// Send a message
router.post("/:id/messages", async (req: AuthRequest, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    res.status(400).json({ error: "Message text is required" });
    return;
  }

  // Verify user is a participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId: req.params.id,
        userId: req.userId!,
      },
    },
  });

  if (!participant) {
    res.status(403).json({ error: "Not a participant in this conversation" });
    return;
  }

  const message = await prisma.message.create({
    data: {
      conversationId: req.params.id,
      senderId: req.userId!,
      text: text.trim(),
      photos: [],
    },
    include: {
      sender: { select: { id: true, name: true, role: true } },
    },
  });

  // Update sender's lastReadAt
  await prisma.conversationParticipant.update({
    where: { id: participant.id },
    data: { lastReadAt: new Date() },
  });

  res.status(201).json(message);
});

export default router;
