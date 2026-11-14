const express = require('express');
const { getDb, queryAll, queryOne, runSql } = require('../db/sqlite');
const { authMiddleware } = require('../middleware/auth');
const { validate, saleSchema } = require('../middleware/validation');

const router = express.Router();

// GET /api/sales
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const businessId = req.query.businessId || req.user.activeBusinessId || 'biz-grocery-demo';

    const sales = queryAll(
      db,
      'SELECT * FROM sales WHERE business_id = ? ORDER BY created_at DESC',
      [businessId]
    ).map((s) => ({
      id: s.id,
      orgId: s.org_id,
      businessId: s.business_id,
      invoiceNumber: s.invoice_number,
      customerId: s.customer_id,
      customerName: s.customer_name,
      customerMobile: s.customer_mobile,
      items: s.items_json ? JSON.parse(s.items_json) : [],
      subtotal: s.subtotal,
      discountAmount: s.discount_amount,
      taxAmount: s.tax_amount,
      totalAmount: s.total_amount,
      costOfGoodsSold: s.cost_of_goods_sold,
      grossProfit: s.gross_profit,
      paymentMethod: s.payment_method,
      paymentStatus: s.payment_status,
      amountReceived: s.amount_received,
      staffName: s.staff_name,
      notes: s.notes,
      createdAt: s.created_at,
    }));

    res.json({ sales, total: sales.length });
  } catch (err) {
    console.error('List sales error:', err);
    res.status(500).json({ error: 'Failed to retrieve sales records' });
  }
});

// GET /api/sales/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const s = queryOne(db, 'SELECT * FROM sales WHERE id = ?', [req.params.id]);
    if (!s) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({
      id: s.id,
      orgId: s.org_id,
      businessId: s.business_id,
      invoiceNumber: s.invoice_number,
      customerId: s.customer_id,
      customerName: s.customer_name,
      customerMobile: s.customer_mobile,
      items: s.items_json ? JSON.parse(s.items_json) : [],
      subtotal: s.subtotal,
      discountAmount: s.discount_amount,
      taxAmount: s.tax_amount,
      totalAmount: s.total_amount,
      costOfGoodsSold: s.cost_of_goods_sold,
      grossProfit: s.gross_profit,
      paymentMethod: s.payment_method,
      paymentStatus: s.payment_status,
      amountReceived: s.amount_received,
      staffName: s.staff_name,
      notes: s.notes,
      createdAt: s.created_at,
    });
  } catch (err) {
    console.error('Get sale error:', err);
    res.status(500).json({ error: 'Failed to retrieve invoice' });
  }
});

// POST /api/sales - POS billing checkout
router.post('/', authMiddleware, validate(saleSchema), async (req, res) => {
  try {
    const db = await getDb();
    const {
      businessId,
      customerName = 'Walk-in Customer',
      customerMobile,
      items,
      discountAmount = 0,
      taxRate = 0,
      paymentMethod = 'UPI',
      amountReceived,
      staffName = 'Owner',
      notes,
    } = req.body;

    const orgId = req.user.orgId || 'org-demo-1';
    const now = new Date().toISOString();
    const saleId = 'sal-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    const invoiceNumber = 'INV-' + Math.floor(100000 + Math.random() * 900000);

    // Deterministic Financial Computations
    let subtotal = 0;
    let totalCOGS = 0;
    const processedItems = [];

    for (const item of items) {
      const lineTotal = item.quantity * item.unitPrice - (item.discount || 0);
      subtotal += lineTotal;

      let itemCost = item.purchaseCost || 0;
      // If productId provided, fetch actual cost and deduct inventory
      if (item.productId) {
        const prod = queryOne(db, 'SELECT * FROM products WHERE id = ?', [item.productId]);
        if (prod) {
          if (!item.purchaseCost && prod.purchase_price) {
            itemCost = prod.purchase_price;
          }
          const newQty = Math.max(0, (prod.quantity || 0) - item.quantity);
          runSql(db, 'UPDATE products SET quantity = ?, updated_at = ? WHERE id = ?', [newQty, now, item.productId]);
        }
      }

      totalCOGS += item.quantity * itemCost;
      processedItems.push({
        ...item,
        lineTotal,
        purchaseCost: itemCost,
      });
    }

    const calculatedTax = Math.round(((subtotal - discountAmount) * (taxRate / 100)) * 100) / 100;
    const totalAmount = Math.max(0, Math.round((subtotal - discountAmount + calculatedTax) * 100) / 100);
    const grossProfit = Math.round((totalAmount - calculatedTax - totalCOGS) * 100) / 100;
    const finalAmountReceived = amountReceived !== undefined ? amountReceived : totalAmount;

    let paymentStatus = 'Completed';
    if (finalAmountReceived < totalAmount) {
      paymentStatus = finalAmountReceived === 0 ? 'Unpaid' : 'Partial';
    }

    // Save Customer if not existing or update balance
    let customerId = null;
    if (customerName && customerName !== 'Walk-in Customer') {
      let cust = queryOne(db, 'SELECT * FROM customers WHERE business_id = ? AND name = ?', [businessId, customerName]);
      if (!cust && customerMobile) {
        cust = queryOne(db, 'SELECT * FROM customers WHERE business_id = ? AND mobile = ?', [businessId, customerMobile]);
      }

      const balanceDelta = Math.max(0, totalAmount - finalAmountReceived);

      if (cust) {
        customerId = cust.id;
        const newSpent = (cust.total_spent || 0) + totalAmount;
        const newBal = (cust.outstanding_balance || 0) + balanceDelta;
        runSql(db, 'UPDATE customers SET total_spent = ?, outstanding_balance = ? WHERE id = ?', [newSpent, newBal, cust.id]);
      } else {
        customerId = 'cust-' + Date.now().toString(36);
        runSql(
          db,
          `INSERT INTO customers (id, org_id, business_id, name, mobile, email, address, gst_number, total_spent, outstanding_balance, notes, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            customerId,
            orgId,
            businessId,
            customerName,
            customerMobile || null,
            null,
            null,
            null,
            totalAmount,
            balanceDelta,
            'Auto-created during checkout',
            now,
          ]
        );
      }
    }

    // Insert Sale Record
    runSql(
      db,
      `INSERT INTO sales (
        id, org_id, business_id, invoice_number, customer_id, customer_name, customer_mobile,
        items_json, subtotal, discount_amount, tax_amount, total_amount, cost_of_goods_sold,
        gross_profit, payment_method, payment_status, amount_received, staff_name, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        saleId,
        orgId,
        businessId,
        invoiceNumber,
        customerId,
        customerName,
        customerMobile || null,
        JSON.stringify(processedItems),
        subtotal,
        discountAmount,
        calculatedTax,
        totalAmount,
        totalCOGS,
        grossProfit,
        paymentMethod,
        paymentStatus,
        finalAmountReceived,
        staffName,
        notes || null,
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
        'SALE_RECORDED',
        'Sale',
        saleId,
        staffName,
        'cashier',
        JSON.stringify({ invoiceNumber, totalAmount, paymentMethod, itemsCount: processedItems.length }),
        now,
      ]
    );

    res.status(201).json({
      message: 'Sale completed successfully',
      invoice: {
        id: saleId,
        invoiceNumber,
        customerName,
        customerMobile,
        items: processedItems,
        subtotal,
        discountAmount,
        taxAmount: calculatedTax,
        totalAmount,
        costOfGoodsSold: totalCOGS,
        grossProfit,
        paymentMethod,
        paymentStatus,
        amountReceived: finalAmountReceived,
        createdAt: now,
      },
    });
  } catch (err) {
    console.error('Checkout sale error:', err);
    res.status(500).json({ error: 'Failed to process POS sale' });
  }
});

module.exports = router;
