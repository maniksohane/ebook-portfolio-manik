require("dotenv").config({
  path: require("path").join(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const ebookRoutes = require("./routes/ebookRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { razorpayWebhook } = require("./controllers/paymentController");
const { createCorsOriginCheck } = require("./services/clientOrigins");
const { getPublicApiOrigin } = require("./services/publicApiOrigin");

const app = express();
const production = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

// Vercel terminates TLS at its reverse proxy. Do not trust arbitrary proxy hops.
if (process.env.VERCEL === "1") app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin: createCorsOriginCheck(process.env.CLIENT_URL),
    credentials: true,
  })
);

// Download IDs are bearer links; never put them (or query strings) in access logs.
morgan.token("safe-path", (req) => req.path.startsWith("/api/payment/download/") ? "/api/payment/download/[redacted]" : req.path);
app.use(morgan(":method :safe-path :status :response-time ms"));

app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);


app.use(express.json({ limit: "2mb" }));

app.use(
  rateLimit({
    windowMs: 60000,
    limit: 120,
  })
);

app.get("/api/health", (req, res) => {
  try { getPublicApiOrigin(process.env); }
  catch { return res.status(503).json({ success: false, message: "Store configuration is incomplete." }); }
  res.set("Cache-Control", "no-store");
  res.json({
    success: true,
    message: "Supabase portfolio API is running",
  });
});

app.use("/api/ebooks", ebookRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: "API route not found." }));

app.use((err, req, res, next) => {
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
  console.error("API request failed:", status);

  res.status(status).json({
    success: false,
    message: production && status >= 500 ? "The store service is temporarily unavailable. Please try again later." : err.message,
  });
});

// Vercel imports the Express app; local development still starts a listener.
module.exports = app;
if (require.main === module && process.env.VERCEL !== "1") {
  const port = process.env.PORT || 5000;
  const server = app.listen(port, () => console.log(`Server running on port ${port}`));
  server.on("error", (error) => {
    console.error(error.code === "EADDRINUSE"
      ? `Port ${port} is already in use. Another API instance may already be running; check /api/health before starting a second one.`
      : "The API could not start.");
    process.exitCode = 1;
  });
}
