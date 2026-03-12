import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

import {
  transformInvoice
} from './invoice.js';

const app = express();
app.use(express.json());

// API Routes will be here

// Serve Swagger UI
const swaggerPath = path.resolve('../swagger.json');
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath));

// Root route endpoint
app.get('/', (req, res) => {
  res.send('Invoice Generator API is running');
});

// Health Check route endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Invoice Generator API'
  });
});

// Create Invoice route endpoint
app.post('/invoices', (req, res) => {
  res.status(201).json({
    message: "Invoice created (placeholder)"
  });
});

// List Invoices route endpoint
app.get('/invoices', (req, res) => {
  res.json({
    invoices: []
  });
});

// Retrieve Invoice route endpoint
app.get('invoices/:invoiceId', (req, res) => {
  const { invoiceId } = req.params;
  res.json({
    invoiceId,
    message: 'Invoice retrieved (placeholder)'
  })
});

// Update Invoice route endpoint
app.put('invoices/:invoiceId', (req, res) => {
  const { invoiceId } = req.params;

  res.json({
    invoiceId,
    message: 'Invoice updated (placeholder)'
  });
});

// Delete Invoice route endpoint
app.delete('invoices/:invoiceId', (req, res) => {
  res.status(204).send();
});

// Validate Invoice route endpoint
app.post('/invoices/:invoiceId/validate', (req, res) => {
  const { invoiceId } = req.params;

  const result = validateInvoice(invoiceId);
  return res.json(result);
});

// Transform Invoice route endpoint
app.post('/invoices/:invoiceId/transform', (req, res) => {
  const { invoiceId } = req.params;

  return res.json(transformInvoice(invoiceId));
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at https://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});