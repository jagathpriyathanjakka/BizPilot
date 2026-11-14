const express = require('express');
const { getDb, queryAll, queryOne, runSql } = require('../db/sqlite');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const businessId = req.query.businessId || req.user.activeBusinessId || 'biz-grocery-demo';
    const orders = queryAll(
      db,
      'SELECT * FROM orders WHERE business_id = ? ORDER BY created_at DESC',
      [businessId]
    ).map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      orderType: o.order_type,
      customerName: o.customer_name,
      customerMobile: o.customer_mobile,
      tableNumber: o.table_number,
      status: o.status,
      items: o.items_json ? JSON.parse(o.items_json) : [],
      totalAmount: o.total_amount,
      isPaid: Boolean(o.is_paid),
      deliveryAddress: o.delivery_address,
      deliveryTimeSlot: o.delivery_time_slot,
      notes: o.notes,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
    }));

    res.json({ orders, count: orders.length });
  } catch (err) {
    console.error('List orders error:', err);
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

// POST /api/orders
router.post('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const {
      businessId = req.user.activeBusinessId || 'biz-grocery-demo',
      orderType = 'Dine-In',
      customerName = 'Walk-in',
      customerMobile,
      tableNumber,
      items = [],
      totalAmount = 0,
      isPaid = false,
      deliveryAddress,
      notes,
    } = req.body;

    const orderId = 'ord-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    const orgId = req.user.orgId || 'org-demo-1';
    const orderNumber = 'ORD-' + Math.floor(100 + Math.random() * 900);
    const now = new Date().toISOString();

    runSql(
      db,
      `INSERT INTO orders (id, org_id, business_id, order_number, order_type, customer_name, customer_mobile, table_number, status, items_json, total_amount, is_paid, delivery_address, delivery_time_slot, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        orgId,
        businessId,
        orderNumber,
        orderType,
        customerName,
        customerMobile || null,
        tableNumber || null,
        'Received',
        JSON.stringify(items),
        totalAmount,
        isPaid ? 1 : 0,
        deliveryAddress || null,
        null,
        notes || null,
        now,
        now,
      ]
    );

    res.status(201).json({
      message: 'Order created successfully',
      order: { id: orderId, orderNumber, status: 'Received', totalAmount },
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT /api/orders/:id/status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const { status, isPaid } = req.body;
    const now = new Date().toISOString();

    runSql(
      db,
      `UPDATE orders SET
        status = COALESCE(?, status),
        is_paid = COALESCE(?, is_paid),
        updated_at = ?
       WHERE id = ?`,
      [status, isPaid !== undefined ? (isPaid ? 1 : 0) : null, now, req.params.id]
    );

    res.json({ message: 'Order status updated successfully' });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
