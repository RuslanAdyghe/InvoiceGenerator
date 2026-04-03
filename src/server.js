import "./env.js";
import express from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import {
  createInvoice,
  getInvoiceById,
  getInvoicesByUserId,
  transformInvoice,
  deleteInvoice,
} from "./invoice.js";
import { validateInvoice } from "./validateInvoice.js";
import { createUser, loginUser, getUserById } from "./auth.js";
import { downloadXml } from "./s3.js";
import { sendInvoiceEmail } from "./sendInvoice.js";
import multer from "multer";
import { extractInvoiceFromFile } from "./invoiceExtractor.js";

const app = express();
app.use(express.json());
app.use(cors());

const swaggerPath = path.join(__dirname, "../swagger.json");
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath));

// Root route endpoint
app.get("/", (req, res) => {
  res.send("Invoice Generator API is running");
});

// Health Check route endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "Invoice Generator API" });
});

// ── Auth ────────────────────────────────────────────────────────────────────

app.post("/auth/signup", async (req, res, next) => {
  const { email, password, companyName } = req.body;
  try {
    res.status(201).json(await createUser(email, password, companyName));
  } catch (error) {
    next(error);
  }
});

app.post("/auth/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    res.json(await loginUser(email, password));
  } catch (error) {
    next(error);
  }
});

app.get("/auth/user/:userId", async (req, res, next) => {
  const { userId } = req.params;
  try {
    res.status(200).json(await getUserById(userId));
  } catch (error) {
    next(error);
  }
});

// ── Invoices (specific routes first, wildcards last) ────────────────────────

app.post("/invoices", async (req, res, next) => {
  const { userId, invoiceData } = req.body;
  try {
    res.status(201).json(await createInvoice(userId, invoiceData));
  } catch (error) {
    next(error);
  }
});

app.get("/invoices", (req, res) => {
  res.json({ invoices: [] });
});

// Specific static-segment routes BEFORE /:invoiceId
app.get("/invoices/user/:userId", async (req, res, next) => {
  const { userId } = req.params;
  try {
    res.status(200).json(await getInvoicesByUserId(userId));
  } catch (error) {
    next(error);
  }
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (["application/pdf", "text/csv"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and CSV files are supported"));
    }
  },
});

app.post("/invoices/extract", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw createError(400, "No file uploaded");
    const extractedData = await extractInvoiceFromFile(req.file.buffer, req.file.mimetype);
    res.json({ success: true, invoiceData: extractedData });
  } catch (err) {
    next(err);
  }
});

// Wildcard /:invoiceId routes AFTER
app.get("/invoices/:invoiceId", async (req, res, next) => {
  const { invoiceId } = req.params;
  try {
    res.status(200).json(await getInvoiceById(invoiceId));
  } catch (error) {
    next(error);
  }
});

app.put("/invoices/:invoiceId", (req, res) => {
  const { invoiceId } = req.params;
  res.json({ invoiceId, message: "Invoice updated (placeholder)" });
});

app.delete("/invoices/:id", async (req, res, next) => {
  try {
    const result = await deleteInvoice(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post("/invoices/:invoiceId/validate", async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const result = await validateInvoice(invoiceId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/invoices/:invoiceId/transform", async (req, res, next) => {
  const { invoiceId } = req.params;
  try {
    res.json(await transformInvoice(invoiceId));
  } catch (error) {
    next(error);
  }
});

app.get("/invoices/:invoiceId/download", async (req, res, next) => {
  const { invoiceId } = req.params;
  try {
    const xml = await downloadXml(invoiceId);
    res.set("Content-Type", "application/xml");
    res.set("Content-Disposition", `attachment; filename="invoice-${invoiceId}.xml"`);
    res.send(xml);
  } catch (error) {
    next(error);
  }
});

app.post("/invoices/:invoiceId/send-email", async (req, res, next) => {
  const { invoiceId } = req.params;
  try {
    res.status(200).json(await sendInvoiceEmail(invoiceId));
  } catch (error) {
    next(error);
  }
});

// ── Docs & Error Handler ────────────────────────────────────────────────────

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  const message = err.message ?? "Internal server error";
  res.status(status).json({ error: message });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at https://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});