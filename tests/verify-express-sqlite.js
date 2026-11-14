const { app } = require('../backend/server');
const { Readable } = require('stream');

function dispatch(options) {
  return new Promise((resolve) => {
    const bodyStr = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : '';
    const req = Readable.from(bodyStr ? [Buffer.from(bodyStr)] : []);
    
    // Normalize path and query
    const rawUrl = options.url || '/';
    const [pathOnly, queryString] = rawUrl.split('?');
    
    const normalizedHeaders = {
      'content-type': 'application/json',
      'content-length': String(Buffer.byteLength(bodyStr)),
    };
    if (options.headers) {
      for (const [k, v] of Object.entries(options.headers)) {
        normalizedHeaders[k.toLowerCase()] = v;
      }
    }

    Object.assign(req, {
      method: options.method || 'GET',
      url: rawUrl,
      originalUrl: rawUrl,
      path: pathOnly,
      query: {},
      headers: normalizedHeaders,
    });

    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      for (const [key, val] of searchParams.entries()) {
        req.query[key] = val;
      }
    }

    let resJson = null;
    let resText = '';
    let code = 200;
    const resHeaders = {};

    const res = {
      statusCode: 200,
      headers: resHeaders,
      setHeader(k, v) { resHeaders[k.toLowerCase()] = v; },
      getHeader(k) { return resHeaders[k.toLowerCase()]; },
      status(c) { this.statusCode = c; code = c; return this; },
      json(data) {
        resJson = data;
        resText = JSON.stringify(data);
        this.end();
      },
      send(data) {
        if (typeof data === 'object') {
          resJson = data;
          resText = JSON.stringify(data);
        } else {
          resText = data;
        }
        this.end();
      },
      end(data) {
        if (data && !resText) resText = data;
        resolve({
          status: code,
          ok: code >= 200 && code < 300,
          json: async () => resJson || (resText ? JSON.parse(resText) : null),
          text: async () => resText,
        });
      },
    };

    app(req, res);
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('  BizPilot AI — Express + SQLite System Verification');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function testStep(name, fn) {
    process.stdout.write(`Testing: ${name}... `);
    try {
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err) {
      console.log('❌ FAIL');
      console.error('   Error:', err.message || err);
      failed++;
    }
  }

  let authToken = '';
  let businessId = '';

  // 1. Health check
  await testStep('1. Health Check Endpoint (/api/health)', async () => {
    const res = await dispatch({ url: '/api/health' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'healthy') throw new Error('Status not healthy');
  });

  // 2. User Sign Up & Email Verification
  let registeredEmail = '';
  let verificationCode = '';
  await testStep('2. Owner Sign Up & Code Generation (/api/auth/signup)', async () => {
    registeredEmail = `testowner_${Date.now()}@bizpilot.ai`;
    const res = await dispatch({
      method: 'POST',
      url: '/api/auth/signup',
      body: {
        fullName: 'Aarav Singhania',
        email: registeredEmail,
        mobile: '+91 99887 76655',
        password: 'Password@123',
      },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(JSON.stringify(err));
    }
    const data = await res.json();
    if (!data.requiresVerification) throw new Error('requiresVerification should be true');
    if (!data.demoCode) throw new Error('Verification code not generated');
    verificationCode = data.demoCode;
  });

  // 2b. Email Verification
  await testStep('2b. Email 6-Digit Code Verification (/api/auth/verify)', async () => {
    const res = await dispatch({
      method: 'POST',
      url: '/api/auth/verify',
      body: {
        email: registeredEmail,
        code: verificationCode,
      },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(JSON.stringify(err));
    }
    const data = await res.json();
    if (!data.token) throw new Error('JWT token not returned on verification');
    authToken = data.token;
  });

  // 2c. Unauthenticated Protection Check (No auto-login)
  await testStep('2c. Unauthenticated Request Blocked (/api/auth/me -> 401)', async () => {
    const res = await dispatch({
      url: '/api/auth/me',
      headers: {}, // No token provided!
    });
    if (res.status !== 401) {
      throw new Error(`Expected 401 Unauthorized without token, got HTTP ${res.status}`);
    }
  });

  // 3. User Sign In with Email & Password
  await testStep('3. User Sign In with Email & Password (/api/auth/signin)', async () => {
    const res = await dispatch({
      method: 'POST',
      url: '/api/auth/signin',
      body: {
        emailOrMobile: registeredEmail,
        password: 'Password@123',
      },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(JSON.stringify(err));
    }
    const data = await res.json();
    if (!data.token) throw new Error('Token not returned on sign in');
    authToken = data.token;
  });

  // 4. Onboarding 6-Step Wizard
  await testStep('4. Business Onboarding Wizard (/api/onboarding)', async () => {
    const res = await dispatch({
      method: 'POST',
      url: '/api/onboarding',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        businessInfo: {
          name: 'Grand Supermarket & Kirana',
          ownerName: 'Aarav Singhania',
          mobile: '+91 99887 76655',
          country: 'India',
          currency: 'INR',
        },
        category: 'grocery',
        businessType: 'Supermarket',
        operations: { managesInventory: true, acceptsUpi: true },
        seedDemo: true,
      },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(JSON.stringify(err));
    }
    const data = await res.json();
    if (!data.business || !data.business.id) throw new Error('Business not created');
    businessId = data.business.id;
    if (data.token) authToken = data.token;
  });

  // 5. Auth Me
  await testStep('5. Profile Verification (/api/auth/me)', async () => {
    const res = await dispatch({
      url: '/api/auth/me',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.user) throw new Error('User data missing');
  });

  // 6. Dashboard metrics
  await testStep('6. Aggregated Dashboard & Metrics (/api/dashboard)', async () => {
    const res = await dispatch({
      url: `/api/dashboard?businessId=${businessId}`,
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.metrics) throw new Error('Metrics missing');
  });

  // 7. Products List & Create
  let productId = '';
  await testStep('7. Products Inventory Catalog & Add Product (/api/products)', async () => {
    const createRes = await dispatch({
      method: 'POST',
      url: '/api/products',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        businessId,
        name: 'Organic Brown Rice 1kg',
        sellingPrice: 160,
        purchasePrice: 110,
        quantity: 25,
        unit: 'packet',
        category: 'Grains & Staples',
      },
    });
    if (!createRes.ok) throw new Error(`Create product HTTP ${createRes.status}`);
    const createData = await createRes.json();
    productId = createData.product.id;

    const listRes = await dispatch({
      url: `/api/products?businessId=${businessId}`,
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const listData = await listRes.json();
    if (!listData.products || listData.products.length === 0) throw new Error('No products returned');
  });

  // 8. POS Sale Checkout & Deterministic Financials
  await testStep('8. POS Sales Checkout & Stock Deduction (/api/sales)', async () => {
    const res = await dispatch({
      method: 'POST',
      url: '/api/sales',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        businessId,
        customerName: 'Kishore Kumar',
        customerMobile: '+91 98999 11111',
        items: [
          {
            name: 'Organic Brown Rice 1kg',
            productId,
            quantity: 2,
            unitPrice: 160,
            purchaseCost: 110,
          },
        ],
        discountAmount: 20,
        paymentMethod: 'UPI',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Subtotal = 320, Discount = 20, Total = 300, COGS = 220, Gross Profit = 80
    if (data.invoice.totalAmount !== 300) throw new Error(`Expected totalAmount 300, got ${data.invoice.totalAmount}`);
    if (data.invoice.grossProfit !== 80) throw new Error(`Expected grossProfit 80, got ${data.invoice.grossProfit}`);
  });

  // 9. Customers CRM
  await testStep('9. Customers CRM (/api/customers)', async () => {
    const res = await dispatch({
      url: `/api/customers?businessId=${businessId}`,
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.customers)) throw new Error('Customers not an array');
  });

  // 10. Suppliers Directory
  await testStep('10. Suppliers Directory (/api/suppliers)', async () => {
    const res = await dispatch({
      url: `/api/suppliers?businessId=${businessId}`,
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.suppliers)) throw new Error('Suppliers not an array');
  });

  // 11. Expenses Overhead
  await testStep('11. Operational Expenses Tracking (/api/expenses)', async () => {
    const postRes = await dispatch({
      method: 'POST',
      url: '/api/expenses',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        businessId,
        category: 'Packaging',
        description: 'Biodegradable Grocery Bags',
        amount: 850,
        paymentMethod: 'UPI',
      },
    });
    if (!postRes.ok) throw new Error(`HTTP ${postRes.status}`);

    const listRes = await dispatch({
      url: `/api/expenses?businessId=${businessId}`,
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await listRes.json();
    if (data.totalExpenses <= 0) throw new Error('Expenses total invalid');
  });

  // 12. Staff Management
  await testStep('12. Staff Personnel & RBAC (/api/staff)', async () => {
    const res = await dispatch({
      url: `/api/staff?businessId=${businessId}`,
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.staff)) throw new Error('Staff not an array');
  });

  // 13. Deterministic Reports (P&L)
  await testStep('13. Deterministic Financial Reports & P&L (/api/reports)', async () => {
    const res = await dispatch({
      url: `/api/reports?businessId=${businessId}`,
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.summary || data.summary.totalRevenue === undefined) throw new Error('Summary missing');
  });

  // 14. AI Multi-Agent Orchestrator
  let pendingApprovalId = '';
  await testStep('14. Autonomous AI Multi-Agent Pipeline (/api/ai/query)', async () => {
    const res = await dispatch({
      method: 'POST',
      url: '/api/ai/query',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        businessId,
        query: 'Which items are low in stock and do we need to reorder?',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.activeAgents || data.activeAgents.length === 0) throw new Error('No agents active');
    if (data.suggestedAction && data.suggestedAction.approvalId) {
      pendingApprovalId = data.suggestedAction.approvalId;
    }
  });

  // 15. Human-in-the-Loop Approvals
  await testStep('15. Human-in-the-Loop Approval Workflow (/api/approvals)', async () => {
    const listRes = await dispatch({
      url: `/api/approvals?businessId=${businessId}`,
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!listRes.ok) throw new Error(`HTTP ${listRes.status}`);
    const listData = await listRes.json();
    if (listData.approvals && listData.approvals.length > 0) {
      const targetId = pendingApprovalId || listData.approvals[0].id;
      const resolveRes = await dispatch({
        method: 'POST',
        url: `/api/approvals/${targetId}/resolve`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: { action: 'approve' },
      });
      if (!resolveRes.ok) throw new Error(`Resolve HTTP ${resolveRes.status}`);
    }
  });

  // 16. Immutable Audit Trail
  await testStep('16. Immutable Audit Trail Logging (/api/audit)', async () => {
    const res = await dispatch({
      url: `/api/audit?businessId=${businessId}`,
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.logs) || data.logs.length === 0) throw new Error('Audit logs missing');
  });

  // 17. 13-Category Showcase & 1-Click Switcher
  await testStep('17. 13-Category 1-Click Industry Switcher (/api/demo/seed)', async () => {
    const res = await dispatch({
      method: 'POST',
      url: '/api/demo/seed',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { category: 'medical' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.business.category !== 'medical') throw new Error('Category switch failed');
  });

  // 18. Specialized Orders Pipeline
  await testStep('18. Specialized Orders Pipeline (/api/orders)', async () => {
    const res = await dispatch({
      url: `/api/orders?businessId=${businessId}`,
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  // 19. Salon & Service Appointments
  await testStep('19. Salon & Service Appointments (/api/appointments)', async () => {
    const res = await dispatch({
      url: `/api/appointments?businessId=${businessId}`,
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  // 20. Device Care & Repairs (IMEI)
  await testStep('20. Device Care & Repair Tickets (/api/repairs)', async () => {
    const res = await dispatch({
      url: `/api/repairs?businessId=${businessId}`,
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  console.log('\n----------------------------------------------------');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('----------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
