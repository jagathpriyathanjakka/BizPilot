import { NextResponse } from 'next/server';
import {
  getBusinessById,
  getProducts,
  getSales,
  getExpenses,
  getCustomers,
  getOrders,
  getAppointments,
  getRepairTickets,
  getAgentTasks,
  getApprovals,
} from '@/lib/db';
import { BUSINESS_CATEGORIES } from '@/lib/categories-config';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId') || 'biz-grocery-demo';

    const business = getBusinessById(businessId);
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const categoryDef = BUSINESS_CATEGORIES[business.category] || BUSINESS_CATEGORIES.grocery;

    const products = getProducts(businessId);
    const sales = getSales(businessId);
    const expenses = getExpenses(businessId);
    const customers = getCustomers(businessId);
    const orders = getOrders(businessId);
    const appointments = getAppointments(businessId);
    const repairs = getRepairTickets(businessId);
    const agentTasks = getAgentTasks(businessId);
    const approvals = getApprovals(businessId);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const yesterdayStr = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
    const currentMonth = todayStr.slice(0, 7);

    // Sales Calculations
    const todaySales = sales.filter((s) => s.createdAt.startsWith(todayStr));
    const yesterdaySales = sales.filter((s) => s.createdAt.startsWith(yesterdayStr));
    const monthSales = sales.filter((s) => s.createdAt.startsWith(currentMonth));

    const totalSalesToday = todaySales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalSalesYesterday = yesterdaySales.reduce((acc, s) => acc + s.totalAmount, 0);
    const monthlyRevenue = monthSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const monthlyCOGS = monthSales.reduce((acc, s) => acc + s.costOfGoodsSold, 0);
    const monthlyGrossProfit = monthlyRevenue - monthlyCOGS;

    // Expenses
    const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
    const totalMonthlyExpenses = monthExpenses.reduce((acc, e) => acc + e.amount, 0);
    const estimatedMonthlyNetProfit = monthlyGrossProfit - totalMonthlyExpenses;

    // Inventory status
    const lowStockCount = products.filter((p) => p.quantity > 0 && p.quantity <= p.minStockLevel).length;
    const outOfStockCount = products.filter((p) => p.quantity === 0).length;

    const sixtyDaysFromNow = new Date(now.getTime() + 60 * 86400000).toISOString().split('T')[0];
    const nearExpiryCount = products.filter((p) => p.expiryDate && p.expiryDate <= sixtyDaysFromNow).length;

    // Receivables
    const pendingReceivables = customers.reduce((acc, c) => acc + c.outstandingBalance, 0);

    // 7-day Sales Chart
    const salesChartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateKey = d.toISOString().split('T')[0];
      const daySales = sales.filter((s) => s.createdAt.startsWith(dateKey));
      const dayTotal = daySales.reduce((acc, s) => acc + s.totalAmount, 0);
      salesChartData.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
        revenue: dayTotal,
      });
    }

    // Category-specific Metrics Map
    let customMetricValues: Record<string, string | number> = {};

    switch (business.category) {
      case 'grocery':
        customMetricValues = {
          nearExpiryCount,
          fastMovingCount: Math.min(products.length, 4),
          dailyFootfall: todaySales.length > 0 ? todaySales.length * 4 : 45,
        };
        break;
      case 'hardware':
        customMetricValues = {
          activeQuotations: 3,
          contractorCredit: 12450,
          wirePipeStock: 1850,
        };
        break;
      case 'agriculture':
        customMetricValues = {
          activeFarmers: customers.length,
          seedsBatchCount: products.filter((p) => p.attributes?.seedPurity).length || 2,
          seasonalDemand: 'Active Sowing',
        };
        break;
      case 'clothing':
        customMetricValues = {
          topSize: 'Size 40 (M)',
          returnRate: '2.4%',
          seasonalStock: 24,
        };
        break;
      case 'medical':
        customMetricValues = {
          criticalExpiryCount: nearExpiryCount,
          scheduleHCount: products.filter((p) => p.attributes?.prescriptionRequired).length,
          genericAlternatives: 142,
        };
        break;
      case 'food':
        customMetricValues = {
          activeTables: '4 / 12',
          activeKOTs: orders.filter((o) => o.status === 'Preparing').length,
          avgPrepTime: '18 mins',
        };
        break;
      case 'stationery':
        customMetricValues = {
          dailyPrintPages: 380,
          pendingJobs: orders.filter((o) => o.status === 'Processing').length,
          tonerPaperHealth: 32,
        };
        break;
      case 'salon':
        customMetricValues = {
          todayAppointments: appointments.length,
          activeStylists: 4,
          serviceRevenue: '85% Service / 15% Retail',
        };
        break;
      case 'travel':
        customMetricValues = {
          upcomingDepartures: 3,
          unconfirmedBookings: orders.filter((o) => !o.isPaid).length,
          customerBalances: 74000,
        };
        break;
      case 'furniture':
        customMetricValues = {
          customOrdersInProgress: orders.filter((o) => o.status === 'Processing').length,
          pendingDeliveries: 2,
          advanceReceived: 28000,
        };
        break;
      case 'electronics':
        customMetricValues = {
          activeRepairs: repairs.filter((r) => r.status !== 'Delivered').length,
          imeiTrackedStock: products.filter((p) => p.attributes?.serialImei).length,
          readyForPickup: repairs.filter((r) => r.status === 'Ready for Pickup').length,
        };
        break;
      case 'footwear':
        customMetricValues = {
          topShoeSize: 'UK 8 & 9',
          pairsInStock: products.reduce((acc, p) => acc + p.quantity, 0),
          exchangeReturns: '1.8%',
        };
        break;
      case 'laundry':
        customMetricValues = {
          activeOrders: orders.filter((o) => o.status !== 'Delivered').length,
          readyDeliveries: orders.filter((o) => o.status === 'Ready' || o.status === 'Out for Delivery').length,
          turnaroundHours: '24 Hours',
        };
        break;
    }

    return NextResponse.json({
      business,
      categoryDef,
      metrics: {
        totalSalesToday,
        totalSalesYesterday,
        todaySalesCount: todaySales.length,
        monthlyRevenue,
        totalMonthlyExpenses,
        monthlyGrossProfit,
        estimatedMonthlyNetProfit,
        totalProducts: products.length,
        lowStockCount,
        outOfStockCount,
        nearExpiryCount,
        totalCustomers: customers.length,
        pendingReceivables,
        pendingApprovalsCount: approvals.filter((a) => a.status === 'Pending').length,
        customMetricValues,
      },
      salesChartData,
      recentSales: sales.slice(0, 5),
      recentOrders: orders.slice(0, 5),
      recentAppointments: appointments.slice(0, 5),
      recentRepairs: repairs.slice(0, 5),
      recentAgentTasks: agentTasks.slice(0, 4),
      pendingApprovals: approvals.filter((a) => a.status === 'Pending'),
    });
  } catch (err: any) {
    console.error('Dashboard aggregation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
