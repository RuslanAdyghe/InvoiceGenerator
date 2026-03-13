import express from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import {createInvoice, getInvoiceById, getInvoicesByUserId, transformInvoice} from "./invoice.js";
import {createUser, loginUser} from "./auth.js";

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

// Delete Invoice route endpoint
app.delete("/invoices/:invoiceId", (req, res) => {
  res.status(204).send();
});

// Validate Invoice route endpoint
app.post("/invoices/:invoiceId/validate", (req, res) => {
  const { invoiceId } = req.params;

  const result = validateInvoice(invoiceId);
  return res.json(result);
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
