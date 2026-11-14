const express = require('express');
const { getDb, queryAll, queryOne, runSql } = require('../db/sqlite');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/appointments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const businessId = req.query.businessId || req.user.activeBusinessId || 'biz-grocery-demo';
    const appointments = queryAll(
      db,
      'SELECT * FROM appointments WHERE business_id = ? ORDER BY date ASC, time_slot ASC',
      [businessId]
    ).map((a) => ({
      id: a.id,
      customerName: a.customer_name,
      customerMobile: a.customer_mobile,
      serviceId: a.service_id,
      serviceName: a.service_name,
      staffId: a.staff_id,
      staffName: a.staff_name,
      date: a.date,
      timeSlot: a.time_slot,
      status: a.status,
      price: a.price,
      notes: a.notes,
      createdAt: a.created_at,
    }));

    res.json({ appointments, count: appointments.length });
  } catch (err) {
    console.error('List appointments error:', err);
    res.status(500).json({ error: 'Failed to retrieve appointments' });
  }
});

// POST /api/appointments
router.post('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const {
      businessId = req.user.activeBusinessId || 'biz-grocery-demo',
      customerName,
      customerMobile,
      serviceName,
      staffName,
      date,
      timeSlot,
      price = 0,
      notes,
    } = req.body;

    if (!customerName || !serviceName || !date || !timeSlot) {
      return res.status(400).json({ error: 'Customer name, service, date and time slot are required' });
    }

    const appointmentId = 'apt-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    const orgId = req.user.orgId || 'org-demo-1';
    const now = new Date().toISOString();

    runSql(
      db,
      `INSERT INTO appointments (id, org_id, business_id, customer_name, customer_mobile, service_id, service_name, staff_id, staff_name, date, time_slot, status, price, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        appointmentId,
        orgId,
        businessId,
        customerName,
        customerMobile || null,
        'srv-' + Date.now().toString(36),
        serviceName,
        null,
        staffName || 'Any Available Stylist',
        date,
        timeSlot,
        'Confirmed',
        price,
        notes || null,
        now,
      ]
    );

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: { id: appointmentId, customerName, serviceName, date, timeSlot, status: 'Confirmed' },
    });
  } catch (err) {
    console.error('Book appointment error:', err);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// PUT /api/appointments/:id/status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const { status } = req.body;

    runSql(db, 'UPDATE appointments SET status = ? WHERE id = ?', [status, req.params.id]);

    res.json({ message: 'Appointment status updated successfully' });
  } catch (err) {
    console.error('Update appointment status error:', err);
    res.status(500).json({ error: 'Failed to update appointment status' });
  }
});

module.exports = router;
