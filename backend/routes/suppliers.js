const express = require('express');
const { getDb, queryAll, queryOne, runSql } = require('../db/sqlite');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/suppliers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const businessId = req.query.businessId || req.user.activeBusinessId || 'biz-grocery-demo';
    const suppliers = queryAll(
      db,
      'SELECT * FROM suppliers WHERE business_id = ? ORDER BY company_name ASC',
      [businessId]
    ).map((s) => ({
      id: s.id,
      name: s.name,
      companyName: s.company_name,
      mobile: s.mobile,
      email: s.email,
      gstin: s.gstin,
      paymentTerms: s.payment_terms,
      balanceOwed: s.balance_owed,
      rating: s.rating,
      createdAt: s.created_at,
    }));

    res.json({ suppliers, total: suppliers.length });
  } catch (err) {
    console.error('List suppliers error:', err);
    res.status(500).json({ error: 'Failed to retrieve suppliers' });
  }
});

// POST /api/suppliers
router.post('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const {
      businessId = req.user.activeBusinessId || 'biz-grocery-demo',
      name,
      companyName,
      mobile,
      email,
      gstin,
      paymentTerms = 'Net 30 Days',
      balanceOwed = 0,
      rating = 5.0,
    } = req.body;

    if (!name && !companyName) {
      return res.status(400).json({ error: 'Supplier or company name is required' });
    }

    const supplierId = 'sup-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    const orgId = req.user.orgId || 'org-demo-1';
    const now = new Date().toISOString();

    runSql(
      db,
      `INSERT INTO suppliers (id, org_id, business_id, name, company_name, mobile, email, gstin, payment_terms, balance_owed, rating, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        supplierId,
        orgId,
        businessId,
        name || companyName,
        companyName || name,
        mobile || null,
        email || null,
        gstin || null,
        paymentTerms,
        balanceOwed,
        rating,
        now,
      ]
    );

    res.status(201).json({
      message: 'Supplier added successfully',
      supplier: { id: supplierId, name: name || companyName, companyName: companyName || name, balanceOwed },
    });
  } catch (err) {
    console.error('Create supplier error:', err);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

module.exports = router;
