# Invoice Generator

A UBL XML invoice generation API with a React frontend.

---

## Prerequisites

Make sure you have the following installed:

- Node.js v20+
- npm
- AWS credentials configured (for DynamoDB access)

---

## Project Structure

```
InvoiceGenerator/
├── src/          ← backend source code
├── frontend/     ← React frontend
├── tests/        ← Jest tests
├── swagger.json  ← API documentation
├── .env          ← environment variables (not committed)
└── package.json
```

---

## Environment Setup

Create a `.env` file in the root of the project:

```
JWT_SECRET=your-secret-key-here
```

---

## Running the Backend

From the root of the project:

```bash
npm install
npm start
```

The server will start at `http://localhost:3000`.

Swagger docs are available at `http://localhost:3000/docs`.

---

## Running the Frontend

In a separate terminal, navigate to the frontend folder:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:5173`.

---

## Running Tests

From the root of the project:

```bash
npm test
npm npm test -- --coverage
```

---

## API Overview

| Method | Route | Description |
|--------|-------|-------------|
| POST | /auth/signup | Create a new user account |
| POST | /auth/login | Login and receive a JWT token |
| POST | /invoices | Create a new invoice |
| GET | /invoices | List invoices |
| GET | /invoices/:invoiceId | Retrieve an invoice by ID |
| POST | /invoices/:invoiceId/transform | Transform invoice to UBL XML |
| POST | /invoices/:invoiceId/validate | Validate a transformed invoice |

---

## Usage

1. Sign up at `http://localhost:5173/signup`
2. Login at `http://localhost:5173/login`
3. Create an invoice from the dashboard
4. The generated UBL XML will be displayed after submission

---

## Tech Stack

- **Backend** — Node.js, Express, AWS DynamoDB
- **Frontend** — React, Vite, Tailwind CSS, React Router DOM
- **Auth** — JWT
- **Docs** — Swagger UI
