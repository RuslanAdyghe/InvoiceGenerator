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
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
});