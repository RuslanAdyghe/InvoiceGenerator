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
  res.status(200).json({
    status: "OK",
    service: "Invoice Generator API",
  });
});

// Create Invoice route endpoint
app.post("/invoices", async (req, res, next) => {
  const { userId, invoiceData } = req.body;

  try {
    res.status(201).json(await createInvoice(userId, invoiceData));
  } catch (error) {
    next(error);
  }
});

// List Invoices route endpoint
app.get("/invoices", (req, res) => {
  res.json({
    invoices: [],
  });
});

// Retrieve Invoice route endpoint
app.get("/invoices/:invoiceId", async (req, res, next) => {
  const { invoiceId } = req.params;

  try {
    res.status(200).json(await getInvoiceById(invoiceId));
  } catch (error) {
    next(error);
  }
});

// Update Invoice route endpoint
app.put("/invoices/:invoiceId", (req, res) => {
  const { invoiceId } = req.params;

  res.json({
    invoiceId,
    message: "Invoice updated (placeholder)",
  });
});

// Validate Invoice route endpoint
app.post("/invoices/:invoiceId/validate", async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const result = await validateInvoice(invoiceId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Transform Invoice route endpoint
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
    res.set(
      "Content-Disposition",
      `attachment; filename="invoice-${invoiceId}.xml"`,
    );
    res.send(xml);
  } catch (error) {
    next(error);
  }
});

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

app.delete("/invoices/:id", async (req, res, next) => {
  try {
    const result = await deleteInvoice(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
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

app.get("/invoices/user/:userId", async (req, res, next) => {
  const { userId } = req.params;

  try {
    res.status(200).json(await getInvoicesByUserId(userId));
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
