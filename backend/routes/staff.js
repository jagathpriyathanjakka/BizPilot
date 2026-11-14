const express = require('express');
const { getDb, queryAll, queryOne, runSql } = require('../db/sqlite');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/staff
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const businessId = req.query.businessId || req.user.activeBusinessId || 'biz-grocery-demo';
    const staff = queryAll(
      db,
      'SELECT * FROM staff WHERE business_id = ? ORDER BY name ASC',
      [businessId]
    ).map((s) => ({
      id: s.id,
      name: s.name,
      mobile: s.mobile,
      email: s.email,
      role: s.role,
      salary: s.salary,
      joiningDate: s.joining_date,
      status: s.status,
      salesCount: s.sales_count,
      salesTotal: s.sales_total,
      permissions: s.permissions_json ? JSON.parse(s.permissions_json) : [],
      createdAt: s.created_at,
    }));

    res.json({ staff, count: staff.length });
  } catch (err) {
    console.error('List staff error:', err);
    res.status(500).json({ error: 'Failed to retrieve staff members' });
  }
});

// POST /api/staff
router.post('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const {
      businessId = req.user.activeBusinessId || 'biz-grocery-demo',
      name,
      mobile,
      email,
      role = 'Cashier',
      salary = 0,
      joiningDate,
      permissions = ['POS_BILLING'],
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Staff member name is required' });
    }

    const staffId = 'stf-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    const orgId = req.user.orgId || 'org-demo-1';
    const now = new Date().toISOString();

    runSql(
      db,
      `INSERT INTO staff (id, org_id, business_id, name, mobile, email, role, salary, joining_date, status, sales_count, sales_total, permissions_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        staffId,
        orgId,
        businessId,
        name,
        mobile || null,
        email || null,
        role,
        salary,
        joiningDate || now.split('T')[0],
        'Active',
        0,
        0,
        JSON.stringify(permissions),
        now,
      ]
    );

    res.status(201).json({
      message: 'Staff member added successfully',
      staff: { id: staffId, name, role, status: 'Active' },
    });
  } catch (err) {
    console.error('Add staff error:', err);
    res.status(500).json({ error: 'Failed to add staff member' });
  }
});

module.exports = router;
