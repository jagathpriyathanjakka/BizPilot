# BizPilot AI — Multi-Business Intelligent Management Platform
> **One Business. Multiple AI Agents. Zero Manual Chaos.**

BizPilot AI is a production-quality, multi-tenant business management SaaS platform designed for small businesses, shops, retailers, service providers, restaurants, and growing enterprises.

Unlike generic dashboards, **BizPilot AI dynamically adapts its entire interface, modules, terminology, data fields, analytics, and operational workflows** to the selected business type.

---

## 🚀 Key Highlights & Architecture

- **13 Built-in Business Industries:**
  1. **Grocery Store:** General grocery, Supermarket, Kirana shop, Provisions. Expiry alerts, low-stock thresholds, fast-moving replenishment.
  2. **Electrical, Hardware & Plumbing:** Wires, switches, CPVC pipes, sanitaryware, power tools, contractor credit ledgers, and technical quotations.
  3. **Agriculture Business:** Certified seed purity tracking, chemical fertilizers (DAP/Urea), pesticides, bio-controls, and seasonal farmer ledger.
  4. **Clothing & Fashion:** Readymade apparel, size & color variants (S, M, L, XL, 32, 34), designer collections, and returns/exchanges.
  5. **Medical Shop (Pharmacy):** Schedule H Rx compliance, salt & generic search, batch numbers, 60-day expiry surveillance, and human Rx verification.
  6. **Food Business:** Restaurants, cafes, bakeries, cloud kitchens. Live Kitchen Order Tickets (KOT), Table management, raw ingredient recipe costing.
  7. **Stationery & Xerox:** Photocopy centers, digital color prints, paper sizes (A4/A3), bookbinding, paper & toner inventory health.
  8. **Parlour & Salon:** Service catalog, unisex/men/women configurations, stylist floor assignment, appointment calendar, and memberships.
  9. **Travel Agency:** Tour package builder, flight/hotel confirmation statuses, itinerary planning, and pending balance follow-ups.
  10. **Furniture Shop:** Home & office furniture, custom woodwork orders, dimensions & polish specs, delivery dispatch, and advance payments.
  11. **Electronics & Mobile Shop:** Smartphones, serial/IMEI tracking, warranty periods, and multi-stage device repair/care tickets.
  12. **Footwear Shop:** Shoe size breakdown (UK 6–11), athletic/formal footwear catalog, and size exchange tracking.
  13. **Laundry & Dry Cleaning:** 7-stage garment laundry pipeline (Received → Processing → Washing → Ironing → Ready → Out for Delivery → Delivered).

---

## 🤖 Multi-Agent AI System

The platform features a central multi-agent architecture with 8 specialized agents:

1. **Central Orchestrator:** Deconstructs user intent, gathers authorized database records, coordinates specialized agents, and prepares execution summaries.
2. **Inventory Intelligence Agent:** Monitors stock levels, flags near-expiry items, and prepares automated supplier restock Purchase Orders.
3. **Sales Intelligence Agent:** Analyzes daily and monthly performance, bestsellers, and footfall trends.
4. **Financial Intelligence Agent:** Computes gross margin and net profit using verified Cost of Goods Sold (COGS). Never assumes uncollected credit as cash.
5. **Supplier Coordination Agent:** Compares supplier terms, tracks balance owed, and prepares PO drafts.
6. **Billing Agent:** Validates invoices, payment channels (Cash, UPI, Card, Bank Transfer), and calculates exact GST totals.
7. **Business Operations Agent:** Organizes appointments, KOT kitchen queues, and repair status transitions.
8. **Audit Agent:** Maintains cryptographic audit logs and enforces human-in-the-loop checkpoints before any sensitive action is authorized.

---

## 🛡️ Security & Human-in-the-Loop Approvals

- **AI Agents Never Mutate Funds Directly:** An AI agent cannot authorize its own restricted action. Sensitive actions (such as generating supplier purchase orders, committing funds, or dispatching customer payment links) enter an **"Awaiting Approval"** state.
- **Deterministic Accounting:** Revenue is calculated strictly from verified POS invoices, never from projections.
- **Organization Isolation:** Multi-business switcher ensures 100% data separation between different stores or branches.
- **Immutable Audit Trail:** Captures the actor name, role, timestamp, action type, and JSON payload for every sensitive operation.

---

## 💻 Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts.
- **Backend:** Next.js Route Handlers (full REST JSON API matching FastAPI architecture).
- **Database:** Thread-safe, multi-tenant persistence layer (`data/bizpilot-store.json`) with atomic file writes and auto-seeding.
- **Authentication:** JWT sessions, bcrypt password hashing, HTTP cookies, and Role-Based Access Control (RBAC).

---

## 🏃 Running the Application

### 1. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 2. Start the Production Server
```bash
npm run build
npm run start
```

### 3. Run the 20-Step Verification Test Suite
```bash
npx tsc tests/verify-system.ts --outDir tests/dist --module commonjs --target es2020 --moduleResolution node --esModuleInterop --skipLibCheck
node tests/dist/tests/verify-system.js
```
Or query the built-in HTTP test runner at `http://localhost:3000/api/test-runner`.

---

## 🔑 Default Credentials

- **Email:** `owner@bizpilot.ai`
- **Password:** `Admin123!`
- **Role:** Owner (Full Administrative Access)

Or click **"Explore Live Workspace Demo"** on the Welcome screen (`/welcome`) for instant access without signing in!
