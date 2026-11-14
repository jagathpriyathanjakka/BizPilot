const express = require('express');
const { getDb, queryAll, queryOne, runSql } = require('../db/sqlite');
const { authMiddleware } = require('../middleware/auth');
const { validate, expenseSchema } = require('../middleware/validation');

const router = express.Router();

// GET /api/expenses
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const businessId = req.query.businessId || req.user.activeBusinessId || 'biz-grocery-demo';
    const expenses = queryAll(
      db,
      'SELECT * FROM expenses WHERE business_id = ? ORDER BY date DESC, created_at DESC',
      [businessId]
    ).map((e) => ({
      id: e.id,
      category: e.category,
      description: e.description,
      amount: e.amount,
      paymentMethod: e.payment_method,
      paidTo: e.paid_to,
      recordedBy: e.recorded_by,
      date: e.date,
      createdAt: e.created_at,
    }));

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({ expenses, totalExpenses, count: expenses.length });
  } catch (err) {
    console.error('List expenses error:', err);
    res.status(500).json({ error: 'Failed to retrieve expenses' });
  }
});

// POST /api/expenses
router.post('/', authMiddleware, validate(expenseSchema), async (req, res) => {
  try {
    const db = await getDb();
    const {
      businessId,
      category = 'General Overhead',
      description,
      amount,
      paymentMethod = 'UPI',
      paidTo,
      date,
    } = req.body;

    const expenseId = 'exp-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    const orgId = req.user.orgId || 'org-demo-1';
    const now = new Date().toISOString();
    const expenseDate = date || now.split('T')[0];

    runSql(
      db,
      `INSERT INTO expenses (id, org_id, business_id, category, description, amount, payment_method, paid_to, recorded_by, date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        expenseId,
        orgId,
        businessId,
        category,
        description,
        amount,
        paymentMethod,
        paidTo || null,
        req.user.fullName || 'Owner',
        expenseDate,
        now,
      ]
    );

    // Audit log
    runSql(
      db,
      `INSERT INTO audit_logs (id, org_id, business_id, action, entity_type, entity_id, actor_name, actor_role, details_json, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'aud-' + Date.now().toString(36),
        orgId,
        businessId,
        'EXPENSE_LOGGED',
        'Expense',
        expenseId,
        req.user.fullName || 'Owner',
        'owner',
        JSON.stringify({ description, amount, category }),
        now,
      ]
    );

    res.status(201).json({
      message: 'Expense recorded successfully',
      expense: { id: expenseId, category, description, amount, paymentMethod, date: expenseDate },
    });
  } catch (err) {
    console.error('Record expense error:', err);
    res.status(500).json({ error: 'Failed to record expense' });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const existing = queryOne(db, 'SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Expense record not found' });
    }

    runSql(db, 'DELETE FROM expenses WHERE id = ?', [req.params.id]);

    res.json({ message: 'Expense record deleted successfully' });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;
