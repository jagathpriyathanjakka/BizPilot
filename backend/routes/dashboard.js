const express = require('express');
const { getDb, queryAll, queryOne } = require('../db/sqlite');
const { authMiddleware } = require('../middleware/auth');
const { CATEGORIES_META } = require('../data/category-seeds');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const businessId = req.query.businessId || req.user.activeBusinessId || 'biz-grocery-demo';

    const business = queryOne(db, 'SELECT * FROM business_profiles WHERE id = ?', [businessId]);
    if (!business) {
      return res.status(404).json({ error: 'Business workspace not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Sales metrics
    const allSales = queryAll(db, 'SELECT * FROM sales WHERE business_id = ? ORDER BY created_at DESC', [businessId]);
    let todayRevenue = 0;
    let todayOrdersCount = 0;
    let totalRevenue = 0;
    let totalCOGS = 0;

    for (const s of allSales) {
      totalRevenue += s.total_amount || 0;
      totalCOGS += s.cost_of_goods_sold || 0;
      if (s.created_at && s.created_at.startsWith(todayStr)) {
        todayRevenue += s.total_amount || 0;
        todayOrdersCount += 1;
      }
    }

    const grossProfit = totalRevenue - totalCOGS;

    // 2. Expenses metrics
    const allExpenses = queryAll(db, 'SELECT * FROM expenses WHERE business_id = ?', [businessId]);
    let totalExpenses = 0;
    let todayExpenses = 0;
    for (const e of allExpenses) {
      totalExpenses += e.amount || 0;
      if (e.date && e.date.startsWith(todayStr)) {
        todayExpenses += e.amount || 0;
      }
    }

    const netProfit = grossProfit - totalExpenses;

    // 3. Products / Inventory metrics
    const allProducts = queryAll(db, 'SELECT * FROM products WHERE business_id = ?', [businessId]);
    const thirtyDaysAhead = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    let lowStockCount = 0;
    let outOfStockCount = 0;
    let nearExpiryCount = 0;

    for (const p of allProducts) {
      if (p.quantity <= 0) {
        outOfStockCount += 1;
      } else if (p.quantity <= (p.min_stock_level || 5)) {
        lowStockCount += 1;
      }
      if (p.expiry_date && p.expiry_date <= thirtyDaysAhead) {
        nearExpiryCount += 1;
      }
    }

    // 4. 7-Day sales trend
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const salesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dStr = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];

      let dayTotal = 0;
      let dayCount = 0;

      for (const s of allSales) {
        if (s.created_at && s.created_at.startsWith(dStr)) {
          dayTotal += s.total_amount || 0;
          dayCount += 1;
        }
      }

      salesTrend.push({
        date: dStr,
        day: dayName,
        revenue: Math.round(dayTotal),
        orders: dayCount,
      });
    }

    // 5. Recent 5 Sales
    const recentSales = allSales.slice(0, 5).map((s) => ({
      id: s.id,
      invoiceNumber: s.invoice_number,
      customerName: s.customer_name,
      totalAmount: s.total_amount,
      paymentMethod: s.payment_method,
      paymentStatus: s.payment_status,
      itemsCount: s.items_json ? JSON.parse(s.items_json).length : 0,
      createdAt: s.created_at,
    }));

    // 6. Pending approvals count
    const pendingApprovals = queryAll(
      db,
      "SELECT id, action_title, impact_amount, agent_type, requested_at FROM approvals WHERE business_id = ? AND status = 'Pending'",
      [businessId]
    );

    // 7. Category-specific Highlights
    const category = business.category;
    const categoryMeta = CATEGORIES_META[category] || CATEGORIES_META.grocery;

    let categoryHighlights = {};
    if (category === 'food' || categoryMeta.features.orders) {
      const activeOrders = queryAll(
        db,
        "SELECT * FROM orders WHERE business_id = ? AND status != 'Completed' AND status != 'Delivered'",
        [businessId]
      );
      categoryHighlights.activeOrdersCount = activeOrders.length;
      categoryHighlights.activeOrders = activeOrders.slice(0, 5);
    }
    if (category === 'salon' || categoryMeta.features.appointments) {
      const todayAppointments = queryAll(
        db,
        'SELECT * FROM appointments WHERE business_id = ? AND date = ?',
        [businessId, todayStr]
      );
      categoryHighlights.todayAppointmentsCount = todayAppointments.length;
      categoryHighlights.todayAppointments = todayAppointments.slice(0, 5);
    }
    if (category === 'electronics' || categoryMeta.features.repairs) {
      const activeRepairs = queryAll(
        db,
        "SELECT * FROM repairs WHERE business_id = ? AND status != 'Delivered' AND status != 'Cancelled'",
        [businessId]
      );
      categoryHighlights.activeRepairsCount = activeRepairs.length;
      categoryHighlights.activeRepairs = activeRepairs.slice(0, 5);
    }

    res.json({
      business: {
        id: business.id,
        name: business.name,
        category: business.category,
        businessType: business.business_type,
        currency: business.currency || 'INR',
        city: business.city,
      },
      categoryMeta,
      metrics: {
        todayRevenue,
        todayOrdersCount,
        totalRevenue,
        totalCOGS,
        grossProfit,
        grossProfitMargin: totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0.0',
        totalExpenses,
        todayExpenses,
        netProfit,
        totalProductsCount: allProducts.length,
        lowStockCount,
        outOfStockCount,
        nearExpiryCount,
        pendingApprovalsCount: pendingApprovals.length,
      },
      salesTrend,
      recentSales,
      pendingApprovals,
      categoryHighlights,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to generate dashboard metrics' });
  }
});

module.exports = router;
