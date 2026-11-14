const express = require('express');
const { getDb, queryAll, queryOne, runSql } = require('../db/sqlite');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/customers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const businessId = req.query.businessId || req.user.activeBusinessId || 'biz-grocery-demo';
    const customers = queryAll(
      db,
      'SELECT * FROM customers WHERE business_id = ? ORDER BY total_spent DESC',
      [businessId]
    ).map((c) => ({
      id: c.id,
      name: c.name,
      mobile: c.mobile,
      email: c.email,
      address: c.address,
      gstNumber: c.gst_number,
      totalSpent: c.total_spent,
      outstandingBalance: c.outstanding_balance,
      notes: c.notes,
      createdAt: c.created_at,
    }));

    res.json({ customers, total: customers.length });
  } catch (err) {
    console.error('List customers error:', err);
    res.status(500).json({ error: 'Failed to retrieve customers' });
  }
});

// POST /api/customers
router.post('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const {
      businessId = req.user.activeBusinessId || 'biz-grocery-demo',
      name,
      mobile,
      email,
      address,
      gstNumber,
      notes,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Customer name is required' });
    }

    const customerId = 'cust-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    const orgId = req.user.orgId || 'org-demo-1';
    const now = new Date().toISOString();

    runSql(
      db,
      `INSERT INTO customers (id, org_id, business_id, name, mobile, email, address, gst_number, total_spent, outstanding_balance, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [customerId, orgId, businessId, name, mobile || null, email || null, address || null, gstNumber || null, 0, 0, notes || null, now]
    );

    res.status(201).json({
      message: 'Customer created successfully',
      customer: { id: customerId, name, mobile, email, totalSpent: 0, outstandingBalance: 0 },
    });
  } catch (err) {
    console.error('Create customer error:', err);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// PUT /api/customers/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const { name, mobile, email, address, gstNumber, outstandingBalance, notes } = req.body;

    runSql(
      db,
      `UPDATE customers SET
        name = COALESCE(?, name),
        mobile = COALESCE(?, mobile),
        email = COALESCE(?, email),
        address = COALESCE(?, address),
        gst_number = COALESCE(?, gst_number),
        outstanding_balance = COALESCE(?, outstanding_balance),
        notes = COALESCE(?, notes)
       WHERE id = ?`,
      [name, mobile, email, address, gstNumber, outstandingBalance, notes, req.params.id]
    );

    res.json({ message: 'Customer updated successfully' });
  } catch (err) {
    console.error('Update customer error:', err);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

module.exports = router;
