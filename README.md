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

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

The `.env` file should contain:

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
npm test -- --coverage
```

---

## API Overview

| Method | Route | Description |
|--------|-------|-------------|
| POST | /auth/signup | Create a new user account |
| POST | /auth/login | Login and receive a JWT token |
| POST | /invoices | Create a new invoice |
| GET | /invoices/:invoiceId | Retrieve an invoice by ID |
| DELETE | /invoices/:invoiceId | Delete an invoice |
| POST | /invoices/:invoiceId/transform | Transform invoice to UBL XML |
| POST | /invoices/:invoiceId/validate | Validate a transformed invoice |
| GET | /invoices/:invoiceId/download | Download invoice as XML file |
| POST | /invoices/{invoiceId}/send-email | Sends the specified UBL XML to the registered email address |

---

## Using Swagger

Swagger UI is available at `http://localhost:3000/docs` once the backend is running.

1. Open `http://localhost:3000/docs` in your browser
2. Click **Authorize** in the top right
3. Sign up or login via the Auth routes to get a JWT token
4. Paste the token into the Authorize dialog and click **Authorize**
5. All invoice routes will now send the token automatically
6. Click **Try it out** on any route, edit the request body, and click **Execute** to test

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
