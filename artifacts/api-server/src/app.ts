import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path"; 
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
          url: req.url?.split("?"),
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

// 🟢 1. SECURE CORS CONFIGURATION
app.use(
  cors({
    origin: "https://arete-adbw.onrender.com",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🟢 2. LIGHTWEIGHT CRON PING ENDPOINT
app.get("/api/ping", (req, res) => {
  res.status(200).send("pong");
});

// 🟢 3. CORE API ROUTER
app.use("/api", router);

// --- SERVE VITE FRONTEND (EXPRESS 5 COMPATIBLE STRUCTURING) ---
const __dirname = path.resolve();
const frontendDistPath = path.join(__dirname, "../arete/dist");

// Serve the static build assets (JS, CSS, images) FIRST
app.use(express.static(frontendDistPath));

// 🟢 4. EXPRESS 5 STANDARD CATCH-ALL FOR WEB PAGES ONLY
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, "index.html"));
});
// --------------------------------------------------------

export default app;
