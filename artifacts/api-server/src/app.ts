import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path"; // 🟢 1. MOVED TO THE TOP HERE
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔴 (The mid-file import that was here is gone)

app.use("/api", router);

// --- SERVE VITE FRONTEND (STEP 2 FIXED) ---
const __dirname = path.resolve();
const frontendDistPath = path.join(__dirname, "artifacts/arete/dist");

// Serve the static build assets (JS, CSS, images)
app.use(express.static(frontendDistPath));

// 🟢 2. CHANGED TO '*any' TO FIX EXPRESS 5 CRASH
app.get("*any", (req, res) => {
  if (req.url.startsWith("/api")) {
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(frontendDistPath, "index.html"));
});
// ------------------------------------

export default app;
