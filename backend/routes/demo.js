const express = require('express');
const { getDb, queryAll, queryOne, runSql } = require('../db/sqlite');
const { authMiddleware, createToken } = require('../middleware/auth');
const { CATEGORIES_META, getSeedProductsForCategory } = require('../data/category-seeds');

const router = express.Router();

// GET /api/demo/categories
router.get('/categories', (req, res) => {
  res.json({ categories: Object.values(CATEGORIES_META) });
});

// POST /api/demo/seed - 1-Click switch to any of the 13 categories
router.post('/seed', authMiddleware, async (req, res) => {
  try {
    const { category } = req.body;
    if (!category || !CATEGORIES_META[category]) {
      return res.status(400).json({ error: `Invalid category. Must be one of: ${Object.keys(CATEGORIES_META).join(', ')}` });
    }

    const db = await getDb();
    const orgId = req.user.orgId || 'org-demo-1';
    const meta = CATEGORIES_META[category];
    const now = new Date().toISOString();

    // Check if business already exists for this org and category
    let business = queryOne(
      db,
      'SELECT * FROM business_profiles WHERE org_id = ? AND category = ?',
      [orgId, category]
    );

    if (!business) {
      const businessId = `biz-${category}-demo`;
      const operations = {
        sellsProducts: meta.features.inventory,
        providesServices: meta.features.appointments || category === 'salon' || category === 'laundry' || category === 'travel',
        managesInventory: meta.features.inventory,
        hasEmployees: true,
        hasMultipleBranches: false,
        acceptsCash: true,
        acceptsUpi: true,
        acceptsCards: true,
        acceptsBankTransfer: true,
        offersDelivery: category === 'grocery' || category === 'food' || category === 'laundry',
      };

      runSql(
        db,
        `INSERT INTO business_profiles (
          id, org_id, name, owner_name, category, business_type, mobile, email,
          address, country, state, city, pincode, gstin, currency, timezone,
          operations_json, onboarding_complete, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          businessId,
          orgId,
          meta.defaultName,
          req.user.fullName || 'Business Owner',
          category,
          meta.defaultType,
          req.user.mobile || '+91 98765 43210',
          `contact@${category}biz.com`,
          'Commercial Plaza, Central Avenue',
          'India',
          'Maharashtra',
          'Mumbai',
          '400001',
          '27AAAAA0000A1Z5',
          'INR',
          'Asia/Kolkata',
          JSON.stringify(operations),
          1,
          now,
        ]
      );

      // Seed Products
      const seedProducts = getSeedProductsForCategory(category, businessId, orgId);
      for (const prod of seedProducts) {
        runSql(
          db,
          `INSERT OR REPLACE INTO products (id, org_id, business_id, name, barcode, sku, category, brand, purchase_price, selling_price, quantity, unit, min_stock_level, expiry_date, attributes_json, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            prod.id,
            prod.org_id,
            prod.business_id,
            prod.name,
            prod.barcode,
            prod.sku,
            prod.category,
            prod.brand,
            prod.purchase_price,
            prod.selling_price,
            prod.quantity,
            prod.unit,
            prod.min_stock_level,
            prod.expiry_date,
            prod.attributes_json,
            prod.created_at,
            prod.updated_at,
          ]
        );
      }

      // Seed 2 Customers
      runSql(
        db,
        `INSERT INTO customers (id, org_id, business_id, name, mobile, email, address, gst_number, total_spent, outstanding_balance, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `cust-${businessId}-1`,
          orgId,
          businessId,
          'Rajesh Mehta',
          '+91 98201 11222',
          'rajesh@example.com',
          'A-102, Ocean View',
          null,
          12500,
          0,
          'Loyal repeat client',
          now,
        ]
      );
      runSql(
        db,
        `INSERT INTO customers (id, org_id, business_id, name, mobile, email, address, gst_number, total_spent, outstanding_balance, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `cust-${businessId}-2`,
          orgId,
          businessId,
          'Sunita Kulkarni',
          '+91 98202 33445',
          'sunita@example.com',
          'B-404, Green Palms',
          null,
          4800,
          850,
          'Khata balance due',
          now,
        ]
      );

      // Seed 1 Supplier
      runSql(
        db,
        `INSERT INTO suppliers (id, org_id, business_id, name, company_name, mobile, email, gstin, payment_terms, balance_owed, rating, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `sup-${businessId}-1`,
          orgId,
          businessId,
          'National Wholesale Distributors',
          'National Wholesale Distributors',
          '+91 98111 22334',
          'orders@nationalwholesale.in',
          '27ABCDE1234F1Z5',
          'Net 30 Days',
          18400,
          4.9,
          now,
        ]
      );

      // Seed 1 Staff Member
      runSql(
        db,
        `INSERT INTO staff (id, org_id, business_id, name, mobile, email, role, salary, joining_date, status, sales_count, sales_total, permissions_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `stf-${businessId}-1`,
          orgId,
          businessId,
          'Vikram Joshi',
          '+91 98700 98765',
          'vikram@bizpilot.ai',
          'Supervisor',
          28000,
          '2023-11-01',
          'Active',
          42,
          84000,
          JSON.stringify(['POS_BILLING', 'VIEW_REPORTS', 'MANAGE_STOCK', 'MANAGE_CUSTOMERS']),
          now,
        ]
      );

      // Seed 1 Sale
      const firstProd = seedProducts[0];
      const items = [{ name: firstProd.name, productId: firstProd.id, quantity: 2, unitPrice: firstProd.selling_price, purchaseCost: firstProd.purchase_price, discount: 0 }];
      const subtotal = firstProd.selling_price * 2;
      const cogs = firstProd.purchase_price * 2;
      runSql(
        db,
        `INSERT INTO sales (id, org_id, business_id, invoice_number, customer_id, customer_name, customer_mobile, items_json, subtotal, discount_amount, tax_amount, total_amount, cost_of_goods_sold, gross_profit, payment_method, payment_status, amount_received, staff_name, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `sal-${businessId}-1`,
          orgId,
          businessId,
          'INV-2001',
          `cust-${businessId}-1`,
          'Rajesh Mehta',
          '+91 98201 11222',
          JSON.stringify(items),
          subtotal,
          0,
          0,
          subtotal,
          cogs,
          subtotal - cogs,
          'UPI',
          'Completed',
          subtotal,
          'Vikram Joshi',
          'Standard checkout',
          now,
        ]
      );

      // Seed 1 Expense
      runSql(
        db,
        `INSERT INTO expenses (id, org_id, business_id, category, description, amount, payment_method, paid_to, recorded_by, date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `exp-${businessId}-1`,
          orgId,
          businessId,
          'Utilities',
          'Store Electricity & Maintenance',
          2200,
          'Bank Transfer',
          'Commercial Plaza Society',
          'Vikram Joshi',
          now.split('T')[0],
          now,
        ]
      );

      // Category-specific order / appointment / repair
      if (meta.features.orders) {
        runSql(
          db,
          `INSERT INTO orders (id, org_id, business_id, order_number, order_type, customer_name, customer_mobile, table_number, status, items_json, total_amount, is_paid, delivery_address, delivery_time_slot, notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `ord-${businessId}-1`,
            orgId,
            businessId,
            'ORD-701',
            category === 'food' ? 'Dine-In' : 'Standard Service',
            'Siddharth Roy',
            '+91 98333 44556',
            category === 'food' ? 'Table 2' : null,
            'In Progress',
            JSON.stringify([{ name: firstProd.name, qty: 1, price: firstProd.selling_price }]),
            firstProd.selling_price,
            1,
            null,
            null,
            'Expedite requested',
            now,
            now,
          ]
        );
      }

      if (meta.features.appointments) {
        runSql(
          db,
          `INSERT INTO appointments (id, org_id, business_id, customer_name, customer_mobile, service_id, service_name, staff_id, staff_name, date, time_slot, status, price, notes, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `apt-${businessId}-1`,
            orgId,
            businessId,
            'Kavita Sen',
            '+91 98444 55667',
            'srv-101',
            category === 'salon' ? 'Bridal Makeup & Hair Styling' : 'Custom Vacation Planning',
            `stf-${businessId}-1`,
            'Vikram Joshi',
            now.split('T')[0],
            '04:00 PM - 05:00 PM',
            'Confirmed',
            2500,
            'VIP client appointment',
            now,
          ]
        );
      }

      if (meta.features.repairs) {
        runSql(
          db,
          `INSERT INTO repairs (id, org_id, business_id, ticket_number, customer_name, customer_mobile, device_type, brand_model, imei_serial, issue_description, estimated_cost, final_cost, status, technician_notes, received_date, ready_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `rep-${businessId}-1`,
            orgId,
            businessId,
            'REP-301',
            'Nitin Sharma',
            '+91 98555 66778',
            'Smartphone',
            'Samsung Galaxy S22',
            '862910394829101',
            'Battery draining fast & overheating',
            2400,
            null,
            'In Progress',
            'Original 3700mAh battery replacement in queue',
            now.split('T')[0],
            null,
          ]
        );
      }

      // Initial task & approval
      runSql(
        db,
        `INSERT INTO agent_tasks (id, org_id, business_id, agent_type, title, prompt, response, status, requires_approval, action_payload_json, approval_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `tsk-${businessId}-1`,
          orgId,
          businessId,
          'Central Orchestrator',
          `${meta.name} Industry Workspace Activated`,
          'Deploy specialized AI agents for category',
          `Configured ${meta.name} workspace with specialized data fields and workflows.`,
          'Completed',
          0,
          null,
          null,
          now,
        ]
      );

      business = queryOne(db, 'SELECT * FROM business_profiles WHERE id = ?', [businessId]);
    }

    // Update active business in organization
    runSql(db, 'UPDATE organizations SET active_business_id = ? WHERE id = ?', [business.id, orgId]);

    // Update token
    const token = createToken({
      userId: req.user.userId,
      email: req.user.email,
      fullName: req.user.fullName,
      role: req.user.role,
      orgId,
      activeBusinessId: business.id,
    });

    res.json({
      message: `Switched to ${meta.name} successfully`,
      token,
      business: {
        id: business.id,
        name: business.name,
        category: business.category,
        businessType: business.business_type,
        currency: business.currency,
        onboardingComplete: true,
      },
      categoryMeta: meta,
    });
  } catch (err) {
    console.error('Demo seed error:', err);
    res.status(500).json({ error: 'Failed to switch industry workspace' });
  }
});

module.exports = router;
