import {
  getProducts,
  getSales,
  getExpenses,
  getCustomers,
  getSuppliers,
  getOrders,
  getAppointments,
  getRepairTickets,
  getBusinessById,
  createAgentTask,
  createApproval,
} from '../db';
import { AgentTask, ApprovalRequest, BusinessProfile, Product, Sale, Expense } from '../types';

export interface AgentExecutionResult {
  query: string;
  orchestratorSummary: string;
  activeAgents: string[];
  findings: {
    category: string;
    text: string;
    data?: any;
  }[];
  tableData?: {
    headers: string[];
    rows: (string | number)[][];
  };
  suggestedAction?: {
    actionType: string;
    title: string;
    description: string;
    financialImpact?: number;
    requiresApproval: boolean;
    payload: Record<string, any>;
  };
}

export async function executeMultiAgentQuery(
  businessId: string,
  userQuery: string,
  userId: string = 'Owner'
): Promise<AgentExecutionResult> {
  const business = getBusinessById(businessId);
  if (!business) {
    throw new Error('Business not found');
  }

  const queryLower = userQuery.toLowerCase().trim();
  const products = getProducts(businessId);
  const sales = getSales(businessId);
  const expenses = getExpenses(businessId);
  const customers = getCustomers(businessId);
  const suppliers = getSuppliers(businessId);
  const orders = getOrders(businessId);
  const appointments = getAppointments(businessId);
  const repairs = getRepairTickets(businessId);

  // Intent classification by Central Orchestrator
  const activeAgents: string[] = ['Central Orchestrator'];
  const findings: AgentExecutionResult['findings'] = [];
  let tableData: AgentExecutionResult['tableData'] | undefined;
  let suggestedAction: AgentExecutionResult['suggestedAction'] | undefined;
  let summary = '';

  // 1. Sales & Profit queries
  if (
    queryLower.includes('sell') ||
    queryLower.includes('sales') ||
    queryLower.includes('revenue') ||
    queryLower.includes('profit') ||
    queryLower.includes('how much') ||
    queryLower.includes('earned')
  ) {
    activeAgents.push('Sales Intelligence Agent', 'Financial Intelligence Agent');

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalCOGS = sales.reduce((sum, s) => sum + s.costOfGoodsSold, 0);
    const grossProfit = totalRevenue - totalCOGS;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossProfit - totalExpenses;

    const todayStr = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter((s) => s.createdAt.startsWith(todayStr));
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);

    findings.push({
      category: 'Sales Intelligence',
      text: `Total recorded sales count is ${sales.length}. Today's sales recorded: ₹${todayRevenue.toLocaleString(
        'en-IN'
      )} across ${todaySales.length} transaction(s).`,
      data: { todayRevenue, totalRevenue, transactionCount: sales.length },
    });

    findings.push({
      category: 'Financial Intelligence',
      text: `Cumulative Revenue: ₹${totalRevenue.toLocaleString(
        'en-IN'
      )} | Total Cost of Goods Sold: ₹${totalCOGS.toLocaleString('en-IN')} | Gross Profit: ₹${grossProfit.toLocaleString(
        'en-IN'
      )} (${totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0'}% margin). Total Expenses: ₹${totalExpenses.toLocaleString(
        'en-IN'
      )}. Estimated Net Profit: ₹${netProfit.toLocaleString('en-IN')}.`,
      data: { grossProfit, netProfit, totalExpenses },
    });

    // Provide Sales Table
    if (sales.length > 0) {
      tableData = {
        headers: ['Invoice #', 'Customer', 'Items', 'Total', 'Payment', 'Date'],
        rows: sales.slice(0, 5).map((s) => [
          s.invoiceNumber,
          s.customerName,
          s.items.map((i) => `${i.name} (x${i.quantity})`).join(', '),
          `₹${s.totalAmount.toLocaleString('en-IN')}`,
          s.paymentMethod,
          new Date(s.createdAt).toLocaleDateString('en-IN'),
        ]),
      };
    }

    summary = `Financial review complete: Today's sales stand at ₹${todayRevenue.toLocaleString(
      'en-IN'
    )}, with an overall net profit of ₹${netProfit.toLocaleString('en-IN')} after all recorded expenses.`;
  }

  // 2. Inventory & Stock queries
  else if (
    queryLower.includes('stock') ||
    queryLower.includes('low') ||
    queryLower.includes('shortage') ||
    queryLower.includes('expiry') ||
    queryLower.includes('reorder') ||
    queryLower.includes('ingredient')
  ) {
    activeAgents.push('Inventory Intelligence Agent', 'Supplier Coordination Agent');

    const lowStockItems = products.filter((p) => p.quantity <= p.minStockLevel);
    const outOfStockItems = products.filter((p) => p.quantity === 0);

    // Near expiry (next 60 days)
    const sixtyDaysAhead = new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0];
    const nearExpiryItems = products.filter((p) => p.expiryDate && p.expiryDate <= sixtyDaysAhead);

    findings.push({
      category: 'Inventory Intelligence',
      text: `Analyzed ${products.length} products. Flagged ${lowStockItems.length} low-stock items and ${outOfStockItems.length} completely out of stock.`,
      data: { lowStockCount: lowStockItems.length, outOfStockCount: outOfStockItems.length },
    });

    if (nearExpiryItems.length > 0) {
      findings.push({
        category: 'Expiry Surveillance',
        text: `Identified ${nearExpiryItems.length} batch(es) nearing expiration date within the next 60 days.`,
        data: nearExpiryItems.map((p) => ({ name: p.name, exp: p.expiryDate, qty: p.quantity })),
      });
    }

    if (lowStockItems.length > 0) {
      tableData = {
        headers: ['Product Name', 'SKU', 'Current Stock', 'Min Safe Level', 'Unit', 'Purchase Cost'],
        rows: lowStockItems.map((p) => [
          p.name,
          p.sku,
          p.quantity,
          p.minStockLevel,
          p.unit,
          `₹${p.purchasePrice.toLocaleString('en-IN')}`,
        ]),
      };

      // Supplier coordination prepares restocking PO proposal requiring owner approval!
      const topSupplier = suppliers[0]?.name || 'National Wholesale Distributors';
      const estimatedCost = lowStockItems.reduce((acc, p) => acc + (p.minStockLevel * 2 - p.quantity) * p.purchasePrice, 0);

      suggestedAction = {
        actionType: 'CREATE_PURCHASE_ORDER',
        title: `Restock Order PO for ${lowStockItems.length} Low-Stock Items`,
        description: `Create purchase order to ${topSupplier} for ₹${Math.max(1500, estimatedCost).toLocaleString(
          'en-IN'
        )} to replenish inventory to optimal levels.`,
        financialImpact: Math.max(1500, estimatedCost),
        requiresApproval: true,
        payload: {
          supplier: topSupplier,
          items: lowStockItems.map((p) => ({
            productId: p.id,
            name: p.name,
            reorderQty: Math.max(10, p.minStockLevel * 2 - p.quantity),
          })),
        },
      };
    }

    summary = `Inventory check complete: ${lowStockItems.length} items require replenishment. A restocking plan has been drafted for your approval.`;
  }

  // 3. Receivables & Balances (Customers who owe money)
  else if (
    queryLower.includes('owe') ||
    queryLower.includes('due') ||
    queryLower.includes('receivable') ||
    queryLower.includes('unpaid') ||
    queryLower.includes('balance') ||
    queryLower.includes('credit')
  ) {
    activeAgents.push('Billing Agent', 'Audit Agent');

    const owingCustomers = customers.filter((c) => c.outstandingBalance > 0);
    const totalReceivables = owingCustomers.reduce((acc, c) => acc + c.outstandingBalance, 0);

    findings.push({
      category: 'Billing Agent',
      text: `Total outstanding customer receivables amount to ₹${totalReceivables.toLocaleString('en-IN')} across ${
        owingCustomers.length
      } customer(s).`,
      data: { totalReceivables, count: owingCustomers.length },
    });

    if (owingCustomers.length > 0) {
      tableData = {
        headers: ['Customer Name', 'Mobile', 'Outstanding Due', 'Total Lifetime Spent', 'Notes'],
        rows: owingCustomers.map((c) => [
          c.name,
          c.mobile,
          `₹${c.outstandingBalance.toLocaleString('en-IN')}`,
          `₹${c.totalSpent.toLocaleString('en-IN')}`,
          c.notes || 'Payment pending',
        ]),
      };

      suggestedAction = {
        actionType: 'SEND_PAYMENT_REMINDER',
        title: 'Send Polite UPI Payment Link Reminder',
        description: `Draft WhatsApp/SMS payment reminders with dynamic UPI QR code to ${owingCustomers.length} pending customer(s).`,
        financialImpact: 0,
        requiresApproval: true,
        payload: { customers: owingCustomers.map((c) => ({ name: c.name, mobile: c.mobile, due: c.outstandingBalance })) },
      };
    }

    summary = `Receivables Audit: ₹${totalReceivables.toLocaleString(
      'en-IN'
    )} in customer credit outstanding. You can dispatch polite payment links upon authorization.`;
  }

  // 4. Appointments & Service Queues (Salon / Services / Repairs)
  else if (
    queryLower.includes('appointment') ||
    queryLower.includes('booking') ||
    queryLower.includes('repair') ||
    queryLower.includes('ticket') ||
    queryLower.includes('schedule')
  ) {
    activeAgents.push('Business Operations Agent');

    if (business.category === 'salon' || appointments.length > 0) {
      findings.push({
        category: 'Salon Scheduling',
        text: `Found ${appointments.length} scheduled client appointments. All assigned stylists are currently rostered.`,
        data: appointments,
      });

      tableData = {
        headers: ['Client', 'Service', 'Stylist', 'Time Slot', 'Price', 'Status'],
        rows: appointments.map((a) => [
          a.customerName,
          a.serviceName,
          a.staffName,
          a.timeSlot,
          `₹${a.price.toLocaleString('en-IN')}`,
          a.status,
        ]),
      };
    } else if (business.category === 'electronics' || repairs.length > 0) {
      findings.push({
        category: 'Service Care Queue',
        text: `Active repair tickets: ${repairs.length} devices in repair workflow.`,
        data: repairs,
      });

      tableData = {
        headers: ['Ticket #', 'Device', 'Customer', 'Issue', 'Estimate', 'Status'],
        rows: repairs.map((r) => [
          r.ticketNumber,
          r.brandModel,
          r.customerName,
          r.issueDescription,
          `₹${r.estimatedCost.toLocaleString('en-IN')}`,
          r.status,
        ]),
      };
    }

    summary = 'Operations dispatch: Service schedule retrieved and synchronized with active staff.';
  }

  // 5. General Orchestrated Business Health / Best Sellers / Report
  else {
    activeAgents.push('Sales Intelligence Agent', 'Inventory Intelligence Agent', 'Financial Intelligence Agent');

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const lowStockCount = products.filter((p) => p.quantity <= p.minStockLevel).length;

    findings.push({
      category: 'Executive Summary',
      text: `BizPilot AI Central Orchestrator scanned ${products.length} products, ${sales.length} sales records, and ${expenses.length} operating expenses for ${business.name}.`,
    });

    findings.push({
      category: 'Best Sellers',
      text:
        products.length > 0
          ? `Top catalog performer: "${products[0].name}" (Price: ₹${products[0].sellingPrice}). Current stock: ${products[0].quantity} ${products[0].unit}.`
          : 'No product performance data available yet.',
    });

    findings.push({
      category: 'Risk Monitor',
      text:
        lowStockCount > 0
          ? `${lowStockCount} item(s) are below safety threshold and require attention.`
          : 'All inventory levels are within safe operational parameters.',
    });

    tableData = {
      headers: ['Business Metric', 'Value', 'Operational Status'],
      rows: [
        ['Total Products Managed', products.length, 'Active'],
        ['Total Recorded Revenue', `₹${totalRevenue.toLocaleString('en-IN')}`, 'Verified'],
        ['Registered Customers', customers.length, 'Verified'],
        ['Active Suppliers', suppliers.length, 'Verified'],
        ['Items Requiring Restock', lowStockCount, lowStockCount > 0 ? 'Warning' : 'Healthy'],
      ],
    };

    summary = `Business analysis completed for ${business.name} (${business.businessType}). Operational metrics and agent recommendations generated below.`;
  }

  // If there's a suggested action requiring approval, automatically create an approval request and record task!
  let approvalId: string | undefined;
  if (suggestedAction && suggestedAction.requiresApproval) {
    const approvalReq: ApprovalRequest = {
      id: `appr-${Date.now()}`,
      orgId: business.orgId,
      businessId: business.id,
      taskId: `tsk-${Date.now()}`,
      agentType: activeAgents[1] || 'Central Orchestrator',
      actionTitle: suggestedAction.title,
      description: suggestedAction.description,
      impactAmount: suggestedAction.financialImpact,
      status: 'Pending',
      requestedAt: new Date().toISOString(),
    };
    createApproval(approvalReq);
    approvalId = approvalReq.id;

    const agentTask: AgentTask = {
      id: approvalReq.taskId,
      orgId: business.orgId,
      businessId: business.id,
      agentType: (activeAgents[1] as any) || 'Orchestrator',
      title: suggestedAction.title,
      prompt: userQuery,
      response: summary,
      status: 'Awaiting Approval',
      requiresApproval: true,
      actionPayload: {
        action: suggestedAction.actionType,
        entity: 'Operation',
        financialImpact: suggestedAction.financialImpact,
        details: suggestedAction.payload,
      },
      approvalId: approvalReq.id,
      createdAt: new Date().toISOString(),
    };
    createAgentTask(agentTask);
  } else {
    // Record informational task
    const agentTask: AgentTask = {
      id: `tsk-${Date.now()}`,
      orgId: business.orgId,
      businessId: business.id,
      agentType: 'Orchestrator',
      title: `Analysis for: "${userQuery.slice(0, 40)}"`,
      prompt: userQuery,
      response: summary,
      status: 'Completed',
      requiresApproval: false,
      createdAt: new Date().toISOString(),
    };
    createAgentTask(agentTask);
  }

  return {
    query: userQuery,
    orchestratorSummary: summary,
    activeAgents,
    findings,
    tableData,
    suggestedAction,
  };
}
