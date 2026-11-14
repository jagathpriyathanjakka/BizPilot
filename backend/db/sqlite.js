const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const isVercel = Boolean(process.env.VERCEL);
const DB_DIR = isVercel
  ? path.join('/tmp', 'bizpilot-data')
  : path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'bizpilot.sqlite');

let db = null;

function ensureDirectoryExists() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[BizPilot] Warning: failed to create DB directory:', err.message);
  }
}

async function getDb() {
  if (db) return db;

  ensureDirectoryExists();
  const SQL = await initSqlJs();

  // If on Vercel, copy pre-seeded database from repo data directory if available
  const repoDbPath = path.join(process.cwd(), 'data', 'bizpilot.sqlite');
  if (isVercel && !fs.existsSync(DB_PATH) && fs.existsSync(repoDbPath)) {
    try {
      fs.copyFileSync(repoDbPath, DB_PATH);
    } catch (e) {
      console.warn('[BizPilot] Could not copy seed DB to /tmp:', e.message);
    }
  }

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    initSchema(db);
    saveDb();
  } else {
    db = new SQL.Database();
    initSchema(db);
    seedDefaultData(db);
    saveDb();
  }

  return db;
}

function saveDb() {
  if (!db) return;
  try {
    ensureDirectoryExists();
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.warn('[BizPilot] Warning: failed to save SQLite file:', err.message);
  }
}

function initSchema(database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password_hash TEXT,
      full_name TEXT,
      mobile TEXT,
      role TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS user_verifications (
      email TEXT PRIMARY KEY,
      code TEXT,
      is_verified INTEGER DEFAULT 0,
      expires_at TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT,
      owner_id TEXT,
      currency TEXT,
      country TEXT,
      active_business_id TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS business_profiles (
      id TEXT PRIMARY KEY,
      org_id TEXT,
      name TEXT,
      owner_name TEXT,
      category TEXT,
      business_type TEXT,
      mobile TEXT,
      email TEXT,
      address TEXT,
      country TEXT,
      state TEXT,
      city TEXT,
      pincode TEXT,
      gstin TEXT,
      currency TEXT,
      timezone TEXT,
      operations_json TEXT,
      onboarding_complete INTEGER,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      org_id TEXT,
      business_id TEXT,
      name TEXT,
      barcode TEXT,
      sku TEXT,
      category TEXT,
      brand TEXT,
      purchase_price REAL,
      selling_price REAL,
      quantity REAL,
      unit TEXT,
      min_stock_level REAL,
      expiry_date TEXT,
      attributes_json TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      org_id TEXT,
      business_id TEXT,
      name TEXT,
      mobile TEXT,
      email TEXT,
      address TEXT,
      gst_number TEXT,
      total_spent REAL,
      outstanding_balance REAL,
      notes TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      org_id TEXT,
      business_id TEXT,
      name TEXT,
      company_name TEXT,
      mobile TEXT,
      email TEXT,
      gstin TEXT,
      payment_terms TEXT,
      balance_owed REAL,
      rating REAL,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      org_id TEXT,
      business_id TEXT,
      invoice_number TEXT,
      customer_id TEXT,
      customer_name TEXT,
      customer_mobile TEXT,
      items_json TEXT,
      subtotal REAL,
      discount_amount REAL,
      tax_amount REAL,
      total_amount REAL,
      cost_of_goods_sold REAL,
      gross_profit REAL,
      payment_method TEXT,
      payment_status TEXT,
      amount_received REAL,
      staff_name TEXT,
      notes TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      org_id TEXT,
      business_id TEXT,
      category TEXT,
      description TEXT,
      amount REAL,
      payment_method TEXT,
      paid_to TEXT,
      recorded_by TEXT,
      date TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      org_id TEXT,
      business_id TEXT,
      name TEXT,
      mobile TEXT,
      email TEXT,
      role TEXT,
      salary REAL,
      joining_date TEXT,
      status TEXT,
      sales_count INTEGER,
      sales_total REAL,
      permissions_json TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      org_id TEXT,
      business_id TEXT,
      order_number TEXT,
      order_type TEXT,
      customer_name TEXT,
      customer_mobile TEXT,
      table_number TEXT,
      status TEXT,
      items_json TEXT,
      total_amount REAL,
      is_paid INTEGER,
      delivery_address TEXT,
      delivery_time_slot TEXT,
      notes TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      org_id TEXT,
      business_id TEXT,
      customer_name TEXT,
      customer_mobile TEXT,
      service_id TEXT,
      service_name TEXT,
      staff_id TEXT,
      staff_name TEXT,
      date TEXT,
      time_slot TEXT,
      status TEXT,
      price REAL,
      notes TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS repairs (
      id TEXT PRIMARY KEY,
      org_id TEXT,
      business_id TEXT,
      ticket_number TEXT,
      customer_name TEXT,
      customer_mobile TEXT,
      device_type TEXT,
      brand_model TEXT,
      imei_serial TEXT,
      issue_description TEXT,
      estimated_cost REAL,
      final_cost REAL,
      status TEXT,
      technician_notes TEXT,
      received_date TEXT,
      ready_date TEXT
    );

    CREATE TABLE IF NOT EXISTS agent_tasks (
      id TEXT PRIMARY KEY,
      org_id TEXT,
      business_id TEXT,
      agent_type TEXT,
      title TEXT,
      prompt TEXT,
      response TEXT,
      status TEXT,
      requires_approval INTEGER,
      action_payload_json TEXT,
      approval_id TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS approvals (
      id TEXT PRIMARY KEY,
      org_id TEXT,
      business_id TEXT,
      task_id TEXT,
      agent_type TEXT,
      action_title TEXT,
      description TEXT,
      impact_amount REAL,
      status TEXT,
      requested_at TEXT,
      resolved_at TEXT,
      resolved_by TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      org_id TEXT,
      business_id TEXT,
      action TEXT,
      entity_type TEXT,
      entity_id TEXT,
      actor_name TEXT,
      actor_role TEXT,
      details_json TEXT,
      timestamp TEXT
    );
  `);
}

function seedDefaultData(database) {
  const now = new Date().toISOString();
  const todayStr = now.split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // 1. Seed Owner User
  database.run(
    `INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'usr-demo-owner',
      'owner@bizpilot.ai',
      '$2a$10$wN10g8y2F6wFw7QyF7iQ3.Wj4v3oZf4KzE3A4R5D6E7F8G9H0I1J2',
      'Sunil Kumar',
      '+91 98765 43210',
      'owner',
      now,
    ]
  );

  database.run(
    `INSERT OR REPLACE INTO user_verifications VALUES (?, ?, ?, ?, ?)`,
    ['owner@bizpilot.ai', '123456', 1, '2099-01-01T00:00:00.000Z', now]
  );

  // 2. Seed Organization
  database.run(
    `INSERT INTO organizations VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'org-demo-1',
      'Om Enterprises Group',
      'usr-demo-owner',
      'INR',
      'India',
      'biz-grocery-demo',
      now,
    ]
  );

  // 3. Seed Grocery Business
  const groceryOps = JSON.stringify({
    sellsProducts: true,
    providesServices: false,
    managesInventory: true,
    hasEmployees: true,
    hasMultipleBranches: false,
    acceptsCash: true,
    acceptsUpi: true,
    acceptsCards: true,
    acceptsBankTransfer: true,
    offersDelivery: true,
    openingHours: '09:00 AM - 09:30 PM',
  });

  database.run(
    `INSERT INTO business_profiles VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'biz-grocery-demo',
      'org-demo-1',
      'Shree Ganesh Supermarket & Kirana',
      'Sunil Kumar',
      'grocery',
      'Supermarket',
      '+91 98765 43210',
      'contact@grocerybiz.com',
      'Shop No. 14, Commercial Plaza, M.G. Road',
      'India',
      'Maharashtra',
      'Mumbai',
      '400001',
      '27AAAAA0000A1Z5',
      'INR',
      'Asia/Kolkata',
      groceryOps,
      1,
      now,
    ]
  );

  // 4. Seed Products
  const products = [
    [
      'prod-1',
      'org-demo-1',
      'biz-grocery-demo',
      'Daawat Rozana Basmati Rice 5kg',
      '8901234001',
      'GRO-RICE-05K',
      'Grains & Staples',
      'Daawat',
      380,
      475,
      45,
      'packet',
      15,
      '2027-04-15',
      JSON.stringify({ batchNumber: 'BCH-2024-R09' }),
      now,
      now,
    ],
    [
      'prod-2',
      'org-demo-1',
      'biz-grocery-demo',
      'Fortune Sunlite Sunflower Oil 1L',
      '8901234002',
      'GRO-OIL-01L',
      'Edible Oils',
      'Fortune',
      122,
      145,
      6,
      'packet',
      12,
      '2027-02-10',
      JSON.stringify({ batchNumber: 'OIL-993-B' }),
      now,
      now,
    ],
    [
      'prod-3',
      'org-demo-1',
      'biz-grocery-demo',
      'Amul Taaza Toned Milk 500ml',
      '8901234003',
      'GRO-MILK-500',
      'Dairy & Bakery',
      'Amul',
      24,
      28,
      2,
      'packet',
      20,
      '2026-11-20',
      JSON.stringify({ batchNumber: 'AML-0442' }),
      now,
      now,
    ],
    [
      'prod-4',
      'org-demo-1',
      'biz-grocery-demo',
      'Aashirvaad Shudh Chakki Atta 10kg',
      '8901234004',
      'GRO-ATTA-10K',
      'Grains & Staples',
      'Aashirvaad',
      410,
      490,
      28,
      'packet',
      10,
      '2027-01-30',
      JSON.stringify({ batchNumber: 'ITC-ATT-88' }),
      now,
      now,
    ],
    [
      'prod-5',
      'org-demo-1',
      'biz-grocery-demo',
      'Tata Salt Vacuum Evaporated 1kg',
      '8901234005',
      'GRO-SALT-01K',
      'Spices & Essentials',
      'Tata Salt',
      22,
      28,
      60,
      'packet',
      25,
      '2027-10-15',
      JSON.stringify({ batchNumber: 'TS-2024' }),
      now,
      now,
    ],
  ];

  for (const p of products) {
    database.run(`INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, p);
  }

  // 5. Seed Customers
  database.run(
    `INSERT INTO customers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'cust-1',
      'org-demo-1',
      'biz-grocery-demo',
      'Ramesh Sharma',
      '+91 98201 12345',
      'ramesh.sharma@gmail.com',
      'B-201, Shanti Niketan, Andheri East, Mumbai',
      '',
      14850,
      0,
      'Prefers UPI payment',
      now,
    ]
  );
  database.run(
    `INSERT INTO customers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'cust-2',
      'org-demo-1',
      'biz-grocery-demo',
      'Anita Desai',
      '+91 98192 67890',
      'anita.desai@yahoo.com',
      'Flat 12, Sunrise Apts, Bandra West',
      '',
      8640,
      450,
      'Pending balance 450 from last delivery',
      now,
    ]
  );

  // 6. Seed Suppliers
  database.run(
    `INSERT INTO suppliers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'sup-1',
      'org-demo-1',
      'biz-grocery-demo',
      'Harish Mehta',
      'National Wholesale Distributors Pvt Ltd',
      '+91 98210 55443',
      'orders@nationaldist.com',
      '27AABCN8831Q1ZS',
      'Net 15 Days',
      14500,
      4.8,
      now,
    ]
  );

  // 7. Seed Sales
  const saleItems1 = JSON.stringify([
    {
      productId: 'prod-1',
      name: 'Daawat Rozana Basmati Rice 5kg',
      sku: 'GRO-RICE-05K',
      quantity: 2,
      unitPrice: 475,
      purchaseCost: 380,
      discount: 0,
      taxRate: 5,
      taxAmount: 47.5,
      total: 950,
    },
  ]);

  database.run(
    `INSERT INTO sales VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'sale-1',
      'org-demo-1',
      'biz-grocery-demo',
      'INV-2024-001',
      'cust-1',
      'Ramesh Sharma',
      '+91 98201 12345',
      saleItems1,
      950,
      0,
      47.5,
      997.5,
      760,
      237.5,
      'UPI',
      'Paid',
      997.5,
      'Sunil Kumar (Owner)',
      '',
      now,
    ]
  );

  // 8. Seed Expenses
  database.run(
    `INSERT INTO expenses VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'exp-1',
      'org-demo-1',
      'biz-grocery-demo',
      'Rent',
      'Monthly Shop Commercial Rent for Plaza Unit',
      18000,
      'Bank Transfer',
      'Plaza Management Ltd',
      'Sunil Kumar',
      todayStr.slice(0, 7) + '-01',
      now,
    ]
  );

  // 9. Seed Staff
  const staffPerms = JSON.stringify({
    canBill: true,
    canManageInventory: true,
    canViewReports: true,
    canManageStaff: true,
    canApproveActions: true,
  });

  database.run(
    `INSERT INTO staff VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'st-1',
      'org-demo-1',
      'biz-grocery-demo',
      'Sunil Kumar',
      '+91 98765 43210',
      'sunil@bizpilot.ai',
      'owner',
      0,
      '2023-01-01',
      'Active',
      142,
      284000,
      staffPerms,
      now,
    ]
  );

  // 10. Seed Agent Task & Approval
  database.run(
    `INSERT INTO agent_tasks VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'tsk-1',
      'org-demo-1',
      'biz-grocery-demo',
      'Inventory',
      'Stock Shortage Detected & Auto-Restock Order Drafted',
      'Monitor inventory levels and identify items below reorder thresholds',
      'Detected 2 items falling below safety threshold. Drafted Purchase Order for National Wholesale Distributors.',
      'Awaiting Approval',
      1,
      JSON.stringify({ supplier: 'National Wholesale Distributors', amount: 8400 }),
      'appr-1',
      now,
    ]
  );

  database.run(
    `INSERT INTO approvals VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'appr-1',
      'org-demo-1',
      'biz-grocery-demo',
      'tsk-1',
      'Inventory Intelligence Agent',
      'Restock PO for Low-Stock Items',
      'Authorize Purchase Order to National Wholesale Distributors for ₹8,400 to prevent stockouts.',
      8400,
      'Pending',
      now,
      null,
      null,
    ]
  );

  // 11. Seed Audit Log
  database.run(
    `INSERT INTO audit_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'aud-1',
      'org-demo-1',
      'biz-grocery-demo',
      'SYSTEM_INITIALIZED',
      'System',
      'org-demo-1',
      'System',
      'system',
      JSON.stringify({ status: 'SQLite database created and seeded with 13-category capability' }),
      now,
    ]
  );
}

// Helper SQL executor to return array of objects
function queryAll(database, sql, params = []) {
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryOne(database, sql, params = []) {
  const rows = queryAll(database, sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function runSql(database, sql, params = []) {
  database.run(sql, params);
  saveDb();
}

module.exports = {
  getDb,
  saveDb,
  queryAll,
  queryOne,
  runSql,
};
