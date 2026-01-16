import express from "express";
import { prisma } from "./config/prisma.js";
import { authRouter } from "./auth/http/auth.routes.js";
import { chatRouter } from "./chat/chat.routes.js";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use("/auth",authRouter);

  app.use("/chat",chatRouter);

  return app;
}
