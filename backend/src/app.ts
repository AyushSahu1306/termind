import express from "express";
import { prisma } from "./config/prisma.js";

export function createApp() {
  const app = express();

  app.get("/health", async(_req, res) => {
    await prisma.healthCheck.create({
      data: {},
    });
    res.json({ status: "ok",db:"connected" });
  });

  return app;
}
