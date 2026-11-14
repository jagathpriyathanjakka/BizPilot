require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb } = require('./db/sqlite');

// Route Handlers
const authRouter = require('./routes/auth');
const onboardingRouter = require('./routes/onboarding');
const businessRouter = require('./routes/business');
const dashboardRouter = require('./routes/dashboard');
const productsRouter = require('./routes/products');
const salesRouter = require('./routes/sales');
const customersRouter = require('./routes/customers');
const suppliersRouter = require('./routes/suppliers');
const expensesRouter = require('./routes/expenses');
const staffRouter = require('./routes/staff');
const reportsRouter = require('./routes/reports');
const ordersRouter = require('./routes/orders');
const appointmentsRouter = require('./routes/appointments');
const repairsRouter = require('./routes/repairs');
const aiRouter = require('./routes/ai');
const approvalsRouter = require('./routes/approvals');
const auditRouter = require('./routes/audit');
const demoRouter = require('./routes/demo');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    product: 'BizPilot AI',
    version: '1.0.0',
    db: 'SQLite 3 (sql.js Wasm)',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/business', businessRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/products', productsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/customers', customersRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/staff', staffRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/repairs', repairsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/audit', auditRouter);
app.use('/api/demo', demoRouter);

// Serve static frontend in production if dist/ exists
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback for React Router
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>BizPilot AI Backend API</title></head>
        <body style="font-family:sans-serif; background:#0b1120; color:#e2e8f0; padding:40px; text-align:center;">
          <h1 style="color:#6366f1;">BizPilot AI API Server is Running on port ${PORT}</h1>
          <p>Multi-Business Intelligent Management Platform</p>
          <p>Frontend client is served via Vite on port 3000 during development or built to <code>dist/</code>.</p>
          <p><a href="/api/health" style="color:#38bdf8;">Check API Health</a></p>
        </body>
        </html>
      `);
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// Initialize database and start listening
async function startServer() {
  try {
    console.log('[BizPilot AI] Initializing SQLite database...');
    await getDb();
    console.log('[BizPilot AI] SQLite database initialized and seeded successfully.');

    app.listen(PORT, () => {
      console.log(`[BizPilot AI] Backend server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[BizPilot AI] Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
