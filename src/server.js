import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

// API Routes will be here

// Serve Swagger UI
const swaggerPath = path.resolve('../swagger.json');
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath))

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

app.post('/invoices', (req, res) => {
  res.status(201).json({
    message: "Invoice "
  });
});

app.get('/invoices', (req, res) => {

});

app.get('/invoices/{invoiceId}', (req, res) => {

});

app.put('invoices/{invoiceId}', (req, res) => {

});

app.delete('invoices/{invoiceId}', (req, res) => {
  
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
});