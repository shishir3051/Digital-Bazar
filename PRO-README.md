# Digital Bazar - Professional E-Commerce Stack

A production-ready full-stack e-commerce application built with FastAPI, React, and MongoDB.

## Features
- **Modular Architecture**: Clean separation of concerns in both frontend and backend.
- **RESTful API**: Fast and robust API endpoints with Pydantic validation.
- **JWT Authentication**: Secure user sessions with token-based authentication.
- **Shopping Cart & Orders**: Fully functional e-commerce workflow.

## Project Structure
### Backend (FastAPI)
- `app/api/`: Modular route handlers.
- `app/core/`: Configuration and security logic.
- `app/db/`: Database connection management.
- `app/models/`: Data validation schemas.
- `app/services/`: Business logic layer.

### Frontend (React)
- `components/`: Modularized UI components.
- `context/`: State management (Auth).
- `services/`: API abstraction layer.

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20+
- MongoDB 6.0+

### Development Setup
1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## API Documentation
Once the backend is running, access the interactive Swagger docs at:
[http://localhost:8000/docs](http://localhost:8000/docs)

## Payments Integration
This project includes scaffolded integrations for payments:

- bKash (sandbox-friendly): Endpoints under `/api/payments/bkash/*`:
  - `POST /api/payments/bkash/create-payment` — Creates a pending order and returns an approval URL and `order_id` (sandbox mock when credentials are not set).
  - `POST /api/payments/bkash/execute-payment` — Execute/verify payment after user approval; marks order as `paid` and clears cart.
  - `POST /api/payments/bkash/webhook` — Webhook endpoint to reconcile payment notifications from bKash.

Configuration (add to backend `.env`):
```
USD_TO_BDT_RATE=108.0
BKASH_BASE_URL=https://token.sandbox.bkash.com
BKASH_APP_KEY=<your_sandbox_app_key>
BKASH_APP_SECRET=<your_sandbox_app_secret>
```

Testing locally:
- With no bKash credentials the API will use a mocked flow to produce an approval URL for manual testing.
- To test webhooks you can use `ngrok` or your reverse proxy to expose `/api/payments/bkash/webhook` and configure the URL in the bKash dashboard.
- Unit tests for payments are in `backend/tests/test_payments.py` and cover mocked create/execute/webhook flows.


## Payments Integration (Stripe + bKash)
This project includes a new payments area with support for bKash (sandbox) and exchange-rate support for USD -> BDT.

Environment variables to configure (add to `backend/.env`):
- `USD_TO_BDT_RATE` (default: 108.0)
- `BKASH_BASE_URL` (e.g. `https://token.sandbox.bkash.com` for sandbox)
- `BKASH_APP_KEY` and `BKASH_APP_SECRET` (your sandbox credentials)

Endpoints added:
- `GET /api/payments/exchange-rate` - returns `{ "usd_to_bdt": <rate> }`
- `POST /api/payments/bkash/create-payment` - create a bKash payment for the current user's cart (requires auth)
- `POST /api/payments/bkash/execute-payment` - execute/verify a bKash payment
- `POST /api/payments/bkash/webhook` - webhook receiver for bKash notifications

Notes:
- The bKash integration includes sandbox-friendly fallback behavior when credentials are not configured. For production, add real sandbox/production credentials and follow bKash documentation for exact endpoint and payloads.
- Frontend shows both USD and BDT values using `GET /api/payments/exchange-rate`.

