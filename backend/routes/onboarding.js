const express = require('express');
const { getDb, queryOne, runSql } = require('../db/sqlite');
const { authMiddleware, createToken } = require('../middleware/auth');
const { validate, onboardingSchema } = require('../middleware/validation');
const { CATEGORIES_META, getSeedProductsForCategory } = require('../data/category-seeds');

const router = express.Router();

// GET /api/onboarding/categories
router.get('/categories', (req, res) => {
  res.json({
    categories: Object.values(CATEGORIES_META)
  });
});

// POST /api/onboarding
router.post('/', authMiddleware, validate(onboardingSchema), async (req, res) => {
  try {
    const { businessInfo, category, businessType, operations = {}, seedDemo = true } = req.body;
    const db = await getDb();
    const now = new Date().toISOString();
    const businessId = 'biz-' + category + '-' + Date.now().toString(36);
    const orgId = req.user.orgId || 'org-demo-1';

    // 1. Insert business profile
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
        businessInfo.name,
        businessInfo.ownerName || req.user.fullName || 'Business Owner',
        category,
        businessType,
        businessInfo.mobile || req.user.mobile || '+91 98765 43210',
        businessInfo.email || req.user.email,
        businessInfo.address || 'Commercial Plaza, Main Street',
        businessInfo.country || 'India',
        businessInfo.state || 'Maharashtra',
        businessInfo.city || 'Mumbai',
        businessInfo.pincode || '400001',
        businessInfo.gstin || '27AAAAA0000A1Z5',
        businessInfo.currency || 'INR',
        businessInfo.timezone || 'Asia/Kolkata',
        JSON.stringify(operations),
        1,
        now,
      ]
    );

    // 2. Set active business on organization
    runSql(
      db,
      'UPDATE organizations SET active_business_id = ? WHERE id = ?',
      [businessId, orgId]
    );

    // 3. Seed demo data if requested
    if (seedDemo) {
      // Products
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
          'Rahul Sharma',
          '+91 98201 11222',
          'rahul.s@example.com',
          'Flat 402, Sunshine Apts',
          null,
          4500,
          0,
          'Regular loyal patron',
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
          'Pooja Verma',
          '+91 98202 33445',
          'pooja.v@example.com',
          'B-12, Rose Villa',
          null,
          2800,
          650,
          'Khata ledger balance pending',
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
          'Vikas Aggarwal',
          'Apex Distributors Pvt Ltd',
          '+91 98111 22334',
          'sales@apexdist.com',
          '27ABCDE1234F1Z5',
          'Net 30 Days',
          12500,
          4.8,
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
          'Amit Patel',
          '+91 98700 12345',
          'amit@bizpilot.ai',
          'Manager',
          25000,
          '2024-01-15',
          'Active',
          14,
          28500,
          JSON.stringify(['POS_BILLING', 'VIEW_REPORTS', 'MANAGE_STOCK']),
          now,
        ]
      );

      // Seed 1 Initial Sale
      const firstProd = seedProducts[0];
      const initialSaleItems = [
        {
          name: firstProd.name,
          productId: firstProd.id,
          quantity: 2,
          unitPrice: firstProd.selling_price,
          purchaseCost: firstProd.purchase_price,
          discount: 0,
        },
      ];
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
          'INV-1001',
          `cust-${businessId}-1`,
          'Rahul Sharma',
          '+91 98201 11222',
          JSON.stringify(initialSaleItems),
          subtotal,
          0,
          0,
          subtotal,
          cogs,
          subtotal - cogs,
          'UPI',
          'Completed',
          subtotal,
          'Amit Patel',
          'First sale recorded during onboarding',
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
          'Electricity Bill Payment',
          1450,
          'UPI',
          'State Power Distribution Ltd',
          'Owner',
          now.split('T')[0],
          now,
        ]
      );

      // Category-specific order / appointment / repair
      const meta = CATEGORIES_META[category] || CATEGORIES_META.grocery;
      if (meta.features.orders) {
        runSql(
          db,
          `INSERT INTO orders (id, org_id, business_id, order_number, order_type, customer_name, customer_mobile, table_number, status, items_json, total_amount, is_paid, delivery_address, delivery_time_slot, notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `ord-${businessId}-1`,
            orgId,
            businessId,
            'ORD-501',
            category === 'food' ? 'Dine-In' : 'Standard Service',
            'Siddharth Roy',
            '+91 98333 44556',
            category === 'food' ? 'Table 4' : null,
            'In Progress',
            JSON.stringify([{ name: firstProd.name, qty: 1, price: firstProd.selling_price }]),
            firstProd.selling_price,
            0,
            null,
            null,
            'Priority queue',
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
            'Ananya Iyer',
            '+91 98444 55667',
            'srv-1',
            category === 'salon' ? 'Hair Spa & Moroccan Blowdry' : 'Holiday Itinerary Consultation',
            `stf-${businessId}-1`,
            'Amit Patel',
            now.split('T')[0],
            '03:30 PM - 04:30 PM',
            'Confirmed',
            1200,
            'First visit booking',
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
            'REP-101',
            'Karan Mehta',
            '+91 98555 66778',
            'Smartphone',
            'OnePlus 11R',
            '863920194829102',
            'Display glass broken, touch working',
            3200,
            null,
            'In Diagnosis',
            'OEM AMOLED assembly ordered',
            now.split('T')[0],
            null,
          ]
        );
      }

      // Initial AI task and approval
      runSql(
        db,
        `INSERT INTO agent_tasks (id, org_id, business_id, agent_type, title, prompt, response, status, requires_approval, action_payload_json, approval_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `tsk-${businessId}-1`,
          orgId,
          businessId,
          'Central Orchestrator',
          'Workspace Provisioned & Agent Swarm Deployed',
          'Initialize workspace and configure business-specific intelligence models',
          `Workspace configured for ${meta.name}. 6 domain-specialized agents loaded into memory.`,
          'Completed',
          0,
          null,
          null,
          now,
        ]
      );
    }

    // Insert audit log
    runSql(
      db,
      `INSERT INTO audit_logs (id, org_id, business_id, action, entity_type, entity_id, actor_name, actor_role, details_json, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'aud-' + Date.now().toString(36),
        orgId,
        businessId,
        'ONBOARDING_COMPLETED',
        'BusinessProfile',
        businessId,
        req.user.fullName || 'Owner',
        'owner',
        JSON.stringify({ name: businessInfo.name, category, businessType }),
        now,
      ]
    );

    // Refresh token with new active business
    const newToken = createToken({
      userId: req.user.userId,
      email: req.user.email,
      fullName: req.user.fullName,
      role: req.user.role,
      orgId,
      activeBusinessId: businessId,
    });

    res.status(201).json({
      message: 'Onboarding completed successfully',
      token: newToken,
      business: {
        id: businessId,
        name: businessInfo.name,
        category,
        businessType,
        currency: businessInfo.currency || 'INR',
        onboardingComplete: true,
      },
    });
  } catch (err) {
    console.error('Onboarding error:', err);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

module.exports = router;
