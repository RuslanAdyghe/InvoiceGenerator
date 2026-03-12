import express from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

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
app.post("/invoices", (req, res) => {
  res.status(201).json({
    message: "Invoice created (placeholder)",
  });
});

// List Invoices route endpoint
app.get("/invoices", (req, res) => {
  res.json({
    invoices: [],
  });
});

// Retrieve Invoice route endpoint
app.get("/invoices/:invoiceId", (req, res) => {
  const { invoiceId } = req.params;
  res.json({
    invoiceId,
    message: "Invoice retrieved (placeholder)",
  });
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

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at https://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});
