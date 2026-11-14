const express = require('express');
const { getDb, queryAll, queryOne, runSql } = require('../db/sqlite');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/repairs
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const businessId = req.query.businessId || req.user.activeBusinessId || 'biz-grocery-demo';
    const repairs = queryAll(
      db,
      'SELECT * FROM repairs WHERE business_id = ? ORDER BY received_date DESC',
      [businessId]
    ).map((r) => ({
      id: r.id,
      ticketNumber: r.ticket_number,
      customerName: r.customer_name,
      customerMobile: r.customer_mobile,
      deviceType: r.device_type,
      brandModel: r.brand_model,
      imeiSerial: r.imei_serial,
      issueDescription: r.issue_description,
      estimatedCost: r.estimated_cost,
      finalCost: r.final_cost,
      status: r.status,
      technicianNotes: r.technician_notes,
      receivedDate: r.received_date,
      readyDate: r.ready_date,
    }));

    res.json({ repairs, count: repairs.length });
  } catch (err) {
    console.error('List repairs error:', err);
    res.status(500).json({ error: 'Failed to retrieve repair tickets' });
  }
});

// POST /api/repairs
router.post('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const {
      businessId = req.user.activeBusinessId || 'biz-grocery-demo',
      customerName,
      customerMobile,
      deviceType = 'Smartphone',
      brandModel,
      imeiSerial,
      issueDescription,
      estimatedCost = 0,
      technicianNotes,
    } = req.body;

    if (!customerName || !brandModel || !issueDescription) {
      return res.status(400).json({ error: 'Customer name, device model and issue description are required' });
    }

    const repairId = 'rep-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    const orgId = req.user.orgId || 'org-demo-1';
    const ticketNumber = 'REP-' + Math.floor(100 + Math.random() * 900);
    const now = new Date().toISOString().split('T')[0];

    runSql(
      db,
      `INSERT INTO repairs (id, org_id, business_id, ticket_number, customer_name, customer_mobile, device_type, brand_model, imei_serial, issue_description, estimated_cost, final_cost, status, technician_notes, received_date, ready_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        repairId,
        orgId,
        businessId,
        ticketNumber,
        customerName,
        customerMobile || null,
        deviceType,
        brandModel,
        imeiSerial || null,
        issueDescription,
        estimatedCost,
        null,
        'Received',
        technicianNotes || null,
        now,
        null,
      ]
    );

    res.status(201).json({
      message: 'Repair ticket generated successfully',
      repair: { id: repairId, ticketNumber, brandModel, status: 'Received', estimatedCost },
    });
  } catch (err) {
    console.error('Create repair error:', err);
    res.status(500).json({ error: 'Failed to create repair ticket' });
  }
});

// PUT /api/repairs/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const { status, finalCost, technicianNotes, readyDate } = req.body;

    runSql(
      db,
      `UPDATE repairs SET
        status = COALESCE(?, status),
        final_cost = COALESCE(?, final_cost),
        technician_notes = COALESCE(?, technician_notes),
        ready_date = COALESCE(?, ready_date)
       WHERE id = ?`,
      [status, finalCost, technicianNotes, readyDate, req.params.id]
    );

    res.json({ message: 'Repair ticket updated successfully' });
  } catch (err) {
    console.error('Update repair error:', err);
    res.status(500).json({ error: 'Failed to update repair ticket' });
  }
});

module.exports = router;
