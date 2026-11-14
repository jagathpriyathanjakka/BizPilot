const express = require('express');
const { getDb, queryAll, queryOne, runSql } = require('../db/sqlite');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/approvals
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const businessId = req.query.businessId || req.user.activeBusinessId || 'biz-grocery-demo';
    const statusFilter = req.query.status;

    let sql = 'SELECT * FROM approvals WHERE business_id = ?';
    const params = [businessId];

    if (statusFilter) {
      sql += ' AND status = ?';
      params.push(statusFilter);
    }
    sql += ' ORDER BY requested_at DESC';

    const approvals = queryAll(db, sql, params).map((a) => ({
      id: a.id,
      taskId: a.task_id,
      agentType: a.agent_type,
      actionTitle: a.action_title,
      description: a.description,
      impactAmount: a.impact_amount,
      status: a.status,
      requestedAt: a.requested_at,
      resolvedAt: a.resolved_at,
      resolvedBy: a.resolved_by,
    }));

    res.json({ approvals, count: approvals.length });
  } catch (err) {
    console.error('List approvals error:', err);
    res.status(500).json({ error: 'Failed to retrieve approvals' });
  }
});

// POST /api/approvals/:id/resolve
router.post('/:id/resolve', authMiddleware, async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be "approve" or "reject"' });
    }

    const db = await getDb();
    const approval = queryOne(db, 'SELECT * FROM approvals WHERE id = ?', [req.params.id]);
    if (!approval) {
      return res.status(404).json({ error: 'Approval request not found' });
    }

    if (approval.status !== 'Pending') {
      return res.status(400).json({ error: `Approval already marked as ${approval.status}` });
    }

    const now = new Date().toISOString();
    const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
    const actorName = req.user.fullName || 'Business Owner';

    // 1. Update Approval record
    runSql(
      db,
      'UPDATE approvals SET status = ?, resolved_at = ?, resolved_by = ? WHERE id = ?',
      [newStatus, now, actorName, req.params.id]
    );

    // 2. Update linked Task if exists
    if (approval.task_id) {
      const taskStatus = action === 'approve' ? 'Completed' : 'Rejected';
      runSql(
        db,
        'UPDATE agent_tasks SET status = ? WHERE id = ?',
        [taskStatus, approval.task_id]
      );
    }

    // 3. Emit Audit Log
    runSql(
      db,
      `INSERT INTO audit_logs (id, org_id, business_id, action, entity_type, entity_id, actor_name, actor_role, details_json, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'aud-' + Date.now().toString(36),
        approval.org_id,
        approval.business_id,
        action === 'approve' ? 'AI_ACTION_APPROVED' : 'AI_ACTION_REJECTED',
        'Approval',
        req.params.id,
        actorName,
        'owner',
        JSON.stringify({ actionTitle: approval.action_title, impactAmount: approval.impact_amount }),
        now,
      ]
    );

    res.json({
      message: `Action ${newStatus.toLowerCase()} successfully`,
      approval: {
        id: req.params.id,
        status: newStatus,
        resolvedAt: now,
        resolvedBy: actorName,
      },
    });
  } catch (err) {
    console.error('Resolve approval error:', err);
    res.status(500).json({ error: 'Failed to resolve approval' });
  }
});

module.exports = router;
