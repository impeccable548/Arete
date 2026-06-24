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
// 🟢 LIGHTWEIGHT CRON PING ENDPOINT
app.get("/api/ping", (req, res) => {
  res.status(200).send("pong");
});

app.use("/api", router);

// --- SERVE VITE FRONTEND (EXPRESS 5 REGEX COMPATIBLE) ---
const __dirname = path.resolve();
const frontendDistPath = path.join(__dirname, "../arete/dist");

// Serve the static build assets (JS, CSS, images)
app.use(express.static(frontendDistPath));

// RegExp matches any string that does NOT start with /api
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});
// --------------------------------------------------------

export default app;
