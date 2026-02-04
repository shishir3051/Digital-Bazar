# Digital Bazar - AI Coding Agent Instructions

## Project Overview
Digital Bazar is a full-stack e-commerce platform with a **FastAPI + MongoDB backend** and **React frontend**, deployed on Render (backend) and Vercel (frontend). The codebase uses async/await patterns, JWT authentication, and includes payment integration with bKash (sandbox).

---

## Architecture

### Backend Structure (`backend/app/`)
```
app/
  ├── main.py              # FastAPI app setup, CORS, startup hooks
  ├── api/
  │   ├── api.py           # Router registration (auth, products, cart, orders, payments, etc.)
  │   ├── deps.py          # Dependency injection helpers
  │   └── endpoints/       # Modular endpoint handlers
  │       ├── auth.py      # Register, login
  │       ├── products.py  # List, get, admin create/update
  │       ├── cart.py      # Add, remove, clear cart
  │       ├── orders.py    # Create, list orders
  │       ├── payments.py  # Exchange rates, bKash flows
  │       ├── admin.py     # Admin-only operations
  │       └── wishlist.py  # Toggle, get wishlist
  ├── core/
  │   ├── config.py        # Pydantic Settings (env vars, JWT, bKash config)
  │   └── security.py      # JWT/password hashing (bcrypt)
  ├── db/
  │   └── mongodb.py       # Motor async client, connection pooling
  └── models/
      └── schemas.py       # Pydantic schemas (User, Product, Order, etc.)
```

### Frontend Structure (`frontend/src/`)
- **Router**: React Router with pages like `/`, `/profile`, `/admin`, `/wishlist`
- **Auth**: JWT token in `localStorage`, `AuthContext` for global state
- **API Layer**: `services/api.js` uses axios with automatic Bearer token injection
- **Components**: Feature-based organization (auth, cart, products, admin, etc.)
- **UI**: Radix UI + Tailwind CSS for styling

### Data Flow
1. **User Login**: Frontend → `/api/auth/login` → JWT token stored in localStorage
2. **Authenticated Requests**: All requests include `Authorization: Bearer <token>`
3. **Backend Auth**: `get_current_user` dependency verifies JWT, fetches user from MongoDB
4. **Cart/Orders**: Cart items are ephemeral (in-memory or session-based); orders persist
5. **Payments**: `GET /api/payments/exchange-rate` → `POST /api/payments/bkash/create-payment` → webhook reconciliation

---

## Developer Workflows

### Running Locally
**Backend** (Python 3.11+):
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# API docs: http://localhost:8000/docs
```

**Frontend** (Node.js 20+):
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

### Environment Setup
- **Backend `.env`**: `MONGO_URL`, `DB_NAME`, `JWT_SECRET`, `USD_TO_BDT_RATE`, `BKASH_*`
- **Frontend `.env`**: `REACT_APP_API_URL` (defaults to `http://localhost:8000/api`)

### Testing
- **Backend**: `pytest backend/tests/test_payments.py` (mocked async DB with `FakeCollection`)
- **Frontend**: Not yet comprehensive; components lack unit tests
- **Manual**: Use `/docs` Swagger UI for API testing with auth bearer tokens

### Deployment
- **Backend**: Render (render.yaml) — uvicorn on port $PORT, Python environment
- **Frontend**: Vercel — Next.js style `vercel.json` with API rewrites (not fully functional)
- **CORS**: `main.py` hardcodes allowed origins; update when deploying to new domain

---

## Key Patterns & Conventions

### Async/Await & Motor (MongoDB)
- All database operations are `async` using `motor.motor_asyncio`
- Use `await db.collection.find_one()`, `await db.collection.insert_one()`, etc.
- Dependency injection: `db = Depends(get_database)` in endpoints

### Authentication & Authorization
- **JWT Token**: 8-day expiry (480 minutes), stored in `user_passwords` collection separately from user docs
- **Password Storage**: Bcrypt hashing with `passlib`; never store plaintext
- **Admin Check**: `current_user.is_admin` boolean flag; check in protected endpoints
- **Protected Routes**: Frontend `ProtectedRoute` wrapper; backend `get_current_user` dependency

### Schema & Validation
- Pydantic `BaseModel` subclasses for request/response validation
- UUID strings for IDs (not ObjectIds) to keep frontend/backend agnostic
- Separate `UserBase`, `UserCreate`, `User`, `UserInDB` for different contexts

### API Versioning
- Single `/api` prefix (no `/v1/` yet)
- `api.py` includes router at both `/api` and `/` for compatibility (edge case handling)
- All endpoints return JSON; 400/401/500 for errors

### Payment Integration (bKash)
- **Sandbox Mode**: If `BKASH_APP_KEY`/`BKASH_APP_SECRET` not set, returns mock token
- **Exchange Rate**: USD → BDT via `USD_TO_BDT_RATE` setting
- **Flow**: Create payment (creates pending order) → Execute payment (marks order paid) → Webhook (reconciles)
- **Test Fixture**: `test_payments.py` uses `FakeDB` and `FakeCollection` to mock async behavior

### Database Design
- Collections: `users`, `user_passwords`, `products`, `cart_items`, `orders`, `wishlist`
- No indexes configured yet (implicit default _id index only)
- Passwords stored separately from user docs for security

### Frontend State Management
- **Auth State**: `AuthContext` + `useAuth()` hook — minimal, no Redux/Zustand
- **Local State**: Components use `useState` for UI toggles, forms
- **API Calls**: Direct axios calls in components or context (no query libraries like React Query)

---

## Common Tasks

### Adding a New Endpoint
1. Create handler in `backend/app/api/endpoints/<feature>.py`
2. Define Pydantic schema in `backend/app/models/schemas.py`
3. Register router in `backend/app/api/api.py` → `api_router.include_router(...)`
4. Call from frontend via `api.js` service function

### Fixing CORS Issues
- Update `allowed_origins` list in `backend/app/main.py`
- Ensure `allow_credentials=True` when using JWT

### Debugging Authentication
- Check token in browser DevTools → Storage → localStorage → `token`
- Verify JWT payload: decode at jwt.io
- Backend logs show request details in `log_requests` middleware

### Adding Admin Features
1. Set `is_admin=True` on user doc in MongoDB
2. Use `ProtectedRoute adminOnly={true}` in frontend
3. Check `current_user.is_admin` in backend endpoint

### Testing Payment Flow
- Use `backend/tests/test_payments.py` as reference
- Mock `get_bkash_token()` returns `{"id_token": "mock-id-token"}` when no credentials
- Orders created with `status: "pending"` until `execute-payment` marks as `"paid"`

---

## File References & Key Patterns

| File | Purpose |
|------|---------|
| [backend/app/main.py](backend/app/main.py) | CORS, middleware, router mounting |
| [backend/app/core/config.py](backend/app/core/config.py) | All settings from env vars |
| [backend/app/api/api.py](backend/app/api/api.py) | Router registration hub |
| [backend/app/core/security.py](backend/app/core/security.py) | JWT/password functions |
| [backend/app/db/mongodb.py](backend/app/db/mongodb.py) | DB connection & pooling |
| [backend/app/api/endpoints/auth.py](backend/app/api/endpoints/auth.py) | Login/register logic |
| [frontend/src/services/api.js](frontend/src/services/api.js) | Axios instance + service exports |
| [frontend/src/context/AuthContext.js](frontend/src/context/AuthContext.js) | Global auth state |

---

## Important Edge Cases

- **URL Encoding in MongoDB**: `mongodb.py` has custom `normalize_mongo_url()` to escape special chars in passwords
- **Redirect Handling**: `main.py` sets `redirect_slashes=False` to prevent 307 redirects breaking CORS
- **Dual Router Mounting**: Routes registered at both `/api` and `/` for backward compatibility
- **Cart Clearing**: After payment, cart is cleared in webhook/execute flow
- **Mock Tokens**: bKash returns mock tokens in development; check for `"mock-id-token"` string in tests

---

## Avoid & Watch For

- ❌ Storing passwords in user docs (they go in `user_passwords` collection)
- ❌ Synchronous database calls (always use `async`/`await` with Motor)
- ❌ Hardcoding API URLs in frontend (use `REACT_APP_API_URL` env var)
- ❌ Blocking I/O in async endpoints (use `httpx.AsyncClient`)
- ❌ ObjectId in responses (use UUID strings for frontend compatibility)
- ⚠️ CORS origins list needs updating for each new deployment domain

---

## Questions to Ask Before Starting

1. **Backend changes**: Will this require a new collection or schema change? How does it affect auth?
2. **Frontend changes**: Does this need state (localStorage, context, component state)?
3. **Payments**: Is this related to bKash? Does it need mocking for local testing?
4. **Deployment**: Are new env vars needed? Will CORS origins need updating?
