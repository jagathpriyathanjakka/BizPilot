const express = require('express');
const { getDb, queryAll, queryOne } = require('../db/sqlite');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/reports - Deterministic financial reports
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const businessId = req.query.businessId || req.user.activeBusinessId || 'biz-grocery-demo';
    const { startDate, endDate } = req.query;

    const business = queryOne(db, 'SELECT * FROM business_profiles WHERE id = ?', [businessId]);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    let salesSql = 'SELECT * FROM sales WHERE business_id = ?';
    const salesParams = [businessId];
    if (startDate) {
      salesSql += ' AND created_at >= ?';
      salesParams.push(startDate);
    }
    if (endDate) {
      salesSql += ' AND created_at <= ?';
      salesParams.push(endDate + 'T23:59:59.999Z');
    }
    salesSql += ' ORDER BY created_at DESC';

    const sales = queryAll(db, salesSql, salesParams);

    let expensesSql = 'SELECT * FROM expenses WHERE business_id = ?';
    const expensesParams = [businessId];
    if (startDate) {
      expensesSql += ' AND date >= ?';
      expensesParams.push(startDate);
    }
    if (endDate) {
      expensesSql += ' AND date <= ?';
      expensesParams.push(endDate);
    }
    expensesSql += ' ORDER BY date DESC';

    const expenses = queryAll(db, expensesSql, expensesParams);

    // Deterministic metrics calculation
    let grossSales = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let totalRevenue = 0;
    let totalCOGS = 0;

    const paymentMethods = {};
    const productStats = {};

    for (const s of sales) {
      grossSales += s.subtotal || 0;
      totalDiscount += s.discount_amount || 0;
      totalTax += s.tax_amount || 0;
      totalRevenue += s.total_amount || 0;
      totalCOGS += s.cost_of_goods_sold || 0;

      // Payment method grouping
      const method = s.payment_method || 'Other';
      paymentMethods[method] = (paymentMethods[method] || 0) + (s.total_amount || 0);

      // Product sales analysis
      const items = s.items_json ? JSON.parse(s.items_json) : [];
      for (const item of items) {
        const key = item.name || 'Unnamed Product';
        if (!productStats[key]) {
          productStats[key] = { name: key, quantity: 0, revenue: 0 };
        }
        productStats[key].quantity += item.quantity || 0;
        productStats[key].revenue += (item.quantity || 0) * (item.unitPrice || 0);
      }
    }

    const grossProfit = totalRevenue - totalTax - totalCOGS;
    const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    let totalExpenses = 0;
    const expensesByCategory = {};
    for (const e of expenses) {
      totalExpenses += e.amount || 0;
      const cat = e.category || 'General';
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (e.amount || 0);
    }

    const netProfit = grossProfit - totalExpenses;
    const netMarginPct = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Top products
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    res.json({
      business: {
        id: business.id,
        name: business.name,
        currency: business.currency || 'INR',
      },
      summary: {
        grossSales: Math.round(grossSales * 100) / 100,
        totalDiscount: Math.round(totalDiscount * 100) / 100,
        totalTax: Math.round(totalTax * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCOGS: Math.round(totalCOGS * 100) / 100,
        grossProfit: Math.round(grossProfit * 100) / 100,
        grossMarginPct: Math.round(grossMarginPct * 10) / 10,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        netMarginPct: Math.round(netMarginPct * 10) / 10,
        totalTransactions: sales.length,
      },
      paymentBreakdown: Object.entries(paymentMethods).map(([method, amount]) => ({
        method,
        amount: Math.round(amount * 100) / 100,
        percentage: totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0,
      })),
      expenseBreakdown: Object.entries(expensesByCategory).map(([category, amount]) => ({
        category,
        amount: Math.round(amount * 100) / 100,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      })),
      topProducts,
    });
  } catch (err) {
    console.error('Reports error:', err);
    res.status(500).json({ error: 'Failed to generate financial reports' });
  }
});

module.exports = router;
