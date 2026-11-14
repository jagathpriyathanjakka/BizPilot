const express = require('express');
const { getDb, queryAll } = require('../db/sqlite');
const { authMiddleware } = require('../middleware/auth');
const { executeMultiAgentQuery } = require('../agents/orchestrator');

const router = express.Router();

// POST /api/ai/query
router.post('/query', authMiddleware, async (req, res) => {
  try {
    const { query, businessId } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query string is required' });
    }

    const db = await getDb();
    const targetBusinessId = businessId || req.user.activeBusinessId || 'biz-grocery-demo';

    const result = await executeMultiAgentQuery(
      db,
      targetBusinessId,
      query,
      req.user.userId || 'usr-demo-owner'
    );

    res.json(result);
  } catch (err) {
    console.error('AI Query error:', err);
    res.status(500).json({ error: err.message || 'AI Orchestrator execution error' });
  }
});

// GET /api/ai/tasks
router.get('/tasks', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const businessId = req.query.businessId || req.user.activeBusinessId || 'biz-grocery-demo';

    const tasks = queryAll(
      db,
      'SELECT * FROM agent_tasks WHERE business_id = ? ORDER BY created_at DESC',
      [businessId]
    ).map((t) => ({
      id: t.id,
      agentType: t.agent_type,
      title: t.title,
      prompt: t.prompt,
      response: t.response,
      status: t.status,
      requiresApproval: Boolean(t.requires_approval),
      actionPayload: t.action_payload_json ? JSON.parse(t.action_payload_json) : null,
      approvalId: t.approval_id,
      createdAt: t.created_at,
    }));

    res.json({ tasks, count: tasks.length });
  } catch (err) {
    console.error('AI tasks error:', err);
    res.status(500).json({ error: 'Failed to retrieve agent tasks' });
  }
});

module.exports = router;
