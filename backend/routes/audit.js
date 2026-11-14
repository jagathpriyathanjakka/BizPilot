const express = require('express');
const { getDb, queryAll } = require('../db/sqlite');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/audit
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const orgId = req.user.orgId || 'org-demo-1';
    const businessId = req.query.businessId;

    let sql = 'SELECT * FROM audit_logs WHERE org_id = ?';
    const params = [orgId];

    if (businessId) {
      sql += ' AND (business_id = ? OR business_id IS NULL)';
      params.push(businessId);
    }
    sql += ' ORDER BY timestamp DESC LIMIT 100';

    const logs = queryAll(db, sql, params).map((l) => ({
      id: l.id,
      orgId: l.org_id,
      businessId: l.business_id,
      action: l.action,
      entityType: l.entity_type,
      entityId: l.entity_id,
      actorName: l.actor_name,
      actorRole: l.actor_role,
      details: l.details_json ? JSON.parse(l.details_json) : {},
      timestamp: l.timestamp,
    }));

    res.json({ logs, count: logs.length });
  } catch (err) {
    console.error('Audit logs error:', err);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

module.exports = router;
