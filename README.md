# BizPilot AI — Multi-Business Intelligent Management Platform
> **One Business. Multiple AI Agents. Zero Manual Chaos.**

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-sql.js%20Wasm-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-20%2F20%20Passing-10B981)](https://github.com/jagathpriyathanjakka/BizPilot)

BizPilot AI is a production-quality, multi-tenant business management SaaS platform designed for small businesses, shops, retailers, service providers, restaurants, and growing enterprises.

Unlike generic dashboards with static templates, **BizPilot AI dynamically adapts its entire user interface, modules, terminology, data fields, financial analytics, and operational workflows** to the selected industry.

---

## 🌟 Key Product Highlights

- **13 Built-in Industry Blueprints:** Pre-configured with domain terminology, stock measurement units, attributes (batches, expiry dates, size-color matrices, serial/IMEI), and operational pipelines.
- **Autonomous Multi-Agent AI System:** Central Orchestrator coordinating 6 specialized intelligence agents across Sales, Inventory, Pricing, Marketing, Operations, and Finance.
- **Human-in-the-Loop Governance:** AI agents can draft restocking purchase orders, dynamic customer discounts, and payment links, but sensitive actions require explicit owner approval before execution.
- **Deterministic Accounting:** Revenue, Cost of Goods Sold (COGS), Gross Profit, and Net Profit are strictly computed from verified transactions—never estimated.
- **1-Click Industry Showcase Switcher:** Test-drive any of the 13 supported industries with realistic seeded catalog items, transactions, and suppliers in under one second.

---

## 🏢 13 Supported Industry Blueprints

| Industry Category | Segment Examples | Stock Unit | Specialized Capabilities |
| :--- | :--- | :--- | :--- |
| **1. Grocery Store** | Supermarket, Kirana, Provision Store | `kg`, `packet` | Fast barcode POS billing, batch expiry surveillance (30d), automated kirana reorder thresholds. |
| **2. Electrical & Hardware** | Electrical shop, Plumbing supplies, Tools | `piece`, `meter`, `roll` | Cable roll length tracking, contractor khata credit ledgers, wholesale quotations. |
| **3. Agriculture Business** | Seeds, Fertilizers, Agrochemicals | `bag`, `quintal` | Certified seed purity tracking, DAP/Urea seasonality, pesticide batch expiry, farmer credit khata. |
| **4. Clothing & Fashion** | Men's, Women's Ethnic, Boutiques | `piece`, `set` | Size-color variant matrix (S, M, L, XL, 32W), garment barcode tags, seasonal fashion turnover. |
| **5. Medical Shop (Pharmacy)** | Retail Pharmacy, Chemist, Surgical | `strip`, `bottle` | Schedule H compliance, salt/generic search, 60-day batch expiry surveillance. |
| **6. Restaurant, Cafe & Food** | Fine Dining, QSR, Cloud Kitchen, Cafe | `portion`, `plate` | Live Kitchen Order Tickets (KOT), dine-in table layout, recipe ingredient costing. |
| **7. Stationery & Xerox** | Bookstore, Digital Xerox, Office Supplies | `page`, `ream` | Per-page print counter billing, high-speed copy jobs, paper ream inventory health. |
| **8. Salon & Beauty Spa** | Unisex Salon, Luxury Spa, Grooming | `session`, `service` | Stylist appointment diary, time-slot scheduling, chemical consumable treatment logs. |
| **9. Tours & Travel Agency** | Tour Operator, Flight/Visa Ticketing | `package`, `ticket` | Holiday itinerary builder, hotel/flight booking vouchers, customer installment tracking. |
| **10. Furniture & Woodwork** | Showroom, Modular Carpentry | `unit`, `set` | Custom carpentry workshop queue, timber polish specs, delivery scheduling. |
| **11. Electronics & Mobile** | Smartphone Store, Appliance Showroom | `piece`, `unit` | Device IMEI/serial tracking, warranty logs, technician repair workbench cards. |
| **12. Footwear Store** | Family Shoes, Sports Sneakers | `pair` | Shoe size-run matrix (UK/Euro 6–11), brand catalog, broken size-run alerts. |
| **13. Laundry & Dry Cleaning** | Dry Cleaners, Express Steam Press | `cloth`, `piece` | 7-stage garment status pipeline (Received → Washing → Ironing → Ready → Dispatched). |

---

## 🤖 Multi-Agent AI System

BizPilot AI includes an autonomous agent swarm running on top of the relational SQLite database:

```
                          ┌───────────────────────────┐
                          │   Central AI Orchestrator │
                          └─────────────┬─────────────┘
                                        │
      ┌────────────────┬────────────────┼────────────────┬────────────────┐
      ▼                ▼                ▼                ▼                ▼
┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
│ Inventory │    │   Sales   │    │  Pricing  │    │ Marketing │    │ Operations│
│   Agent   │    │   Agent   │    │   Agent   │    │   Agent   │    │   Agent   │
└───────────┘    └───────────┘    └───────────┘    └───────────┘    └───────────┘
      │
      ▼
┌────────────────────────────────────────────────────────┐
│ Human-in-the-Loop Approval Checkpoint (Owner Decision) │
└────────────────────────────────────────────────────────┘
```

1. **Central Orchestrator:** Classifies natural language prompts, dispatches tasks, and synthesizes structured findings and data tables.
2. **Inventory Intelligence Agent:** Audits stock quantities against safety reorder thresholds; drafts automated Purchase Orders (POs) to suppliers.
3. **Sales Intelligence Agent:** Tracks day-over-day transaction velocity, average basket sizes, and peak footfall hours.
4. **Financial Intelligence Agent:** Computes Gross Profit Margin and Net Operating Income using verified Cost of Goods Sold (COGS).
5. **Pricing & Margin Agent:** Safeguards profitability by flagging loss-leader discounts and suggesting optimal markups.
6. **Customer & Marketing Agent:** Identifies overdue receivables (Khata credit) and drafts polite WhatsApp payment reminder links.
7. **Service Operations Agent:** Manages table turnover in restaurants, stylist diary utilization in salons, and repair cards in tech care centers.

---

## 🛡️ Security & Governance

- **Zero Direct Fund Mutation:** AI agents can draft and propose actions, but cannot move funds without explicit human authorization.
- **Immutable Audit Trail:** All database operations (sale checkouts, product deletions, expense recordings, approval decisions) are stamped in `audit_logs` with actor details, role, timestamp, and JSON delta.
- **Multi-Tenant Isolation:** Complete organization and workspace separation across all database queries.

---

## 💻 Tech Stack

### Frontend
- **Framework:** React 18 with Vite 5
- **Routing:** React Router v6 (SPA routing with automatic deep-link fallback)
- **Styling:** Tailwind CSS (Navy `#090D16` dark theme, violet/cyan gradients, glassmorphism)
- **Icons & Charts:** Lucide React, Recharts (Area & Pie charts)
- **API Client:** Axios / Fetch API with automatic JWT Bearer token injection

### Backend
- **Runtime:** Node.js (v20+)
- **Server:** Express.js 4 with CORS, JSON body-parser, and global error handling
- **Authentication:** JSON Web Tokens (JWT) & bcrypt password hashing
- **Validation:** Zod schemas for all request payloads
- **Database:** SQLite 3 via `sql.js` (official WebAssembly engine), persisted to `data/bizpilot.sqlite`

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v20 or higher
- [npm](https://www.npmjs.com/) v10 or higher

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jagathpriyathanjakka/BizPilot.git
   cd BizPilot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the frontend:**
   ```bash
   npm run build
   ```

4. **Start the application:**
   ```bash
   npm start
   ```

5. **Open in your browser:**
   Navigate to **[http://localhost:5000](http://localhost:5000)**.

---

## 🔑 Pre-Configured Demo Credentials

To test the application immediately without running through onboarding:
- **Email:** `owner@bizpilot.ai`
- **Password:** `Password@123`
- **Role:** Business Owner

---

## 🧪 Verification & Testing

BizPilot AI includes an automated 20-step verification test suite covering all end-to-end user journeys:

```bash
npm run test:system
```

### Verified Test Journeys (20/20 Passed):
1. Health Check Endpoint (`/api/health`)
2. Owner User Registration (`/api/auth/signup`)
3. Owner Authentication (`/api/auth/signin`)
4. 6-Step Business Onboarding Wizard (`/api/onboarding`)
5. Profile & Organization Verification (`/api/auth/me`)
6. Aggregated Dashboard & 7-Day Trend Metrics (`/api/dashboard`)
7. Product Catalog CRUD & Safety Levels (`/api/products`)
8. POS Sales Checkout & Stock Reduction (`/api/sales`)
9. Customers CRM & Khata Balances (`/api/customers`)
10. Suppliers & Procurement Directory (`/api/suppliers`)
11. Operational Overheads & Expenses (`/api/expenses`)
12. Staff Personnel & RBAC (`/api/staff`)
13. Deterministic Profit & Loss Statement (`/api/reports`)
14. Autonomous AI Multi-Agent Pipeline (`/api/ai/query`)
15. Human-in-the-Loop Approval Workflow (`/api/approvals`)
16. Immutable Audit Trail Logging (`/api/audit`)
17. 13-Category 1-Click Industry Switcher (`/api/demo/seed`)
18. Restaurant & Food KOT Pipeline (`/api/orders`)
19. Salon & Service Appointments Diary (`/api/appointments`)
20. Device Care & Repairs IMEI Workbench (`/api/repairs`)

---

## 📂 Project Directory Structure

```text
BIZPILOT/
├── backend/                  # Node.js + Express Backend
│   ├── agents/               # Multi-Agent Central Orchestrator
│   │   └── orchestrator.js
│   ├── data/                 # 13-industry demo seed definitions
│   │   └── category-seeds.js
│   ├── db/                   # SQLite 3 WebAssembly engine & schema
│   │   └── sqlite.js
│   ├── middleware/           # JWT auth & Zod validation
│   │   ├── auth.js
│   │   └── validation.js
│   ├── routes/               # 17 Express REST API route handlers
│   │   ├── ai.js, appointments.js, approvals.js, audit.js, auth.js,
│   │   ├── business.js, customers.js, dashboard.js, demo.js,
│   │   ├── expenses.js, onboarding.js, orders.js, products.js,
│   │   ├── repairs.js, reports.js, sales.js, staff.js, suppliers.js
│   └── server.js             # Main Express entrypoint (Port 5000)
├── src/                      # React 18 + Vite Frontend
│   ├── components/           # UI widgets & modals
│   │   ├── AICommandModal.jsx, CategoryIcon.jsx, MetricCard.jsx,
│   │   ├── Navbar.jsx, NewProductModal.jsx, QuickPOSModal.jsx,
│   │   ├── SalesChart.jsx, Sidebar.jsx
│   ├── pages/                # 16 complete application pages
│   │   ├── Welcome.jsx, SignIn.jsx, SignUp.jsx, Onboarding.jsx,
│   │   ├── Dashboard.jsx, Products.jsx, Sales.jsx, Customers.jsx,
│   │   ├── Suppliers.jsx, Expenses.jsx, Staff.jsx, Reports.jsx,
│   │   ├── AI.jsx, Approvals.jsx, Specialized.jsx, Settings.jsx
│   ├── api.js                # Unified API client
│   ├── categories.js         # 13 industry specifications
│   ├── index.css             # Tailwind base & glassmorphism styles
│   ├── main.jsx              # React DOM entrypoint
│   └── App.jsx               # React Router navigation tree
├── tests/
│   └── verify-express-sqlite.js # 20-step verification test suite
├── dist/                     # Production build artifacts
├── index.html                # Vite HTML shell
├── package.json              # Dependencies and lifecycle scripts
├── tailwind.config.js        # Theme & color tokens
└── vite.config.js            # Vite configuration & API proxy
```

---

## 📄 License
This project is licensed under the MIT License.
