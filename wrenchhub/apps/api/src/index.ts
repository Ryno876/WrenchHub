import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import vehicleRoutes from "./routes/vehicles";
import mechanicRoutes from "./routes/mechanics";
import jobRoutes from "./routes/jobs";
import bidRoutes from "./routes/bids";

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/mechanics", mechanicRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/bids", bidRoutes);

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`WrenchHub API running on http://localhost:${PORT}`);
  });
}

export { app };
