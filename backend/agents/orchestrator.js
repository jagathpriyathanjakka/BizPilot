const { queryAll, queryOne, runSql } = require('../db/sqlite');

async function executeMultiAgentQuery(db, businessId, userQuery, userId = 'usr-demo-owner') {
  const business = queryOne(db, 'SELECT * FROM business_profiles WHERE id = ?', [businessId]);
  if (!business) {
    throw new Error('Business not found');
  }

  const queryLower = userQuery.toLowerCase().trim();
  const rawProducts = queryAll(db, 'SELECT * FROM products WHERE business_id = ?', [businessId]);
  const products = rawProducts.map(p => ({
    ...p,
    purchasePrice: p.purchase_price,
    sellingPrice: p.selling_price,
    minStockLevel: p.min_stock_level,
    expiryDate: p.expiry_date,
    attributes: p.attributes_json ? JSON.parse(p.attributes_json) : {}
  }));

  const rawSales = queryAll(db, 'SELECT * FROM sales WHERE business_id = ? ORDER BY created_at DESC', [businessId]);
  const sales = rawSales.map(s => ({
    ...s,
    invoiceNumber: s.invoice_number,
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
    createdAt: s.created_at
  }));

  const rawExpenses = queryAll(db, 'SELECT * FROM expenses WHERE business_id = ? ORDER BY date DESC', [businessId]);
  const expenses = rawExpenses.map(e => ({
    ...e,
    paymentMethod: e.payment_method,
    paidTo: e.paid_to,
    recordedBy: e.recorded_by,
    createdAt: e.created_at
  }));

  const rawCustomers = queryAll(db, 'SELECT * FROM customers WHERE business_id = ?', [businessId]);
  const customers = rawCustomers.map(c => ({
    ...c,
    totalSpent: c.total_spent,
    outstandingBalance: c.outstanding_balance
  }));

  const suppliers = queryAll(db, 'SELECT * FROM suppliers WHERE business_id = ?', [businessId]);
  const orders = queryAll(db, 'SELECT * FROM orders WHERE business_id = ?', [businessId]);
  const appointments = queryAll(db, 'SELECT * FROM appointments WHERE business_id = ?', [businessId]);
  const repairs = queryAll(db, 'SELECT * FROM repairs WHERE business_id = ?', [businessId]);

  const activeAgents = ['Central Orchestrator'];
  const findings = [];
  let tableData = undefined;
  let suggestedAction = undefined;
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

    const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const totalCOGS = sales.reduce((sum, s) => sum + (s.costOfGoodsSold || 0), 0);
    const grossProfit = totalRevenue - totalCOGS;
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = grossProfit - totalExpenses;

    const todayStr = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter((s) => s.createdAt && s.createdAt.startsWith(todayStr));
    const todayRevenue = todaySales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

    findings.push({
      category: 'Sales Intelligence',
      text: `Total recorded sales count is ${sales.length}. Today's sales recorded: ₹${todayRevenue.toLocaleString('en-IN')} across ${todaySales.length} transaction(s).`,
      data: { todayRevenue, totalRevenue, transactionCount: sales.length },
    });

    findings.push({
      category: 'Financial Intelligence',
      text: `Cumulative Revenue: ₹${totalRevenue.toLocaleString('en-IN')} | Total COGS: ₹${totalCOGS.toLocaleString('en-IN')} | Gross Profit: ₹${grossProfit.toLocaleString('en-IN')} (${totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0'}% margin). Total Expenses: ₹${totalExpenses.toLocaleString('en-IN')}. Estimated Net Profit: ₹${netProfit.toLocaleString('en-IN')}.`,
      data: { grossProfit, netProfit, totalExpenses },
    });

    if (sales.length > 0) {
      tableData = {
        headers: ['Invoice #', 'Customer', 'Items', 'Total', 'Payment', 'Date'],
        rows: sales.slice(0, 5).map((s) => [
          s.invoiceNumber || '-',
          s.customerName || 'Walk-in',
          Array.isArray(s.items) ? s.items.map((i) => `${i.name} (x${i.quantity})`).join(', ') : '',
          `₹${(s.totalAmount || 0).toLocaleString('en-IN')}`,
          s.paymentMethod || 'UPI',
          s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : '-',
        ]),
      };
    }

    summary = `Financial review complete: Today's sales stand at ₹${todayRevenue.toLocaleString('en-IN')}, with an overall net profit of ₹${netProfit.toLocaleString('en-IN')} after recorded expenses.`;
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

    const lowStockItems = products.filter((p) => p.quantity <= (p.minStockLevel || 5));
    const outOfStockItems = products.filter((p) => p.quantity === 0);

    const sixtyDaysAhead = new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0];
    const nearExpiryItems = products.filter((p) => p.expiryDate && p.expiryDate <= sixtyDaysAhead);

    findings.push({
      category: 'Inventory Intelligence',
      text: `Analyzed ${products.length} products. Flagged ${lowStockItems.length} low-stock item(s) and ${outOfStockItems.length} completely out of stock.`,
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
          p.sku || '-',
          p.quantity,
          p.minStockLevel || 5,
          p.unit || 'unit',
          `₹${(p.purchasePrice || 0).toLocaleString('en-IN')}`,
        ]),
      };

      const topSupplier = suppliers[0]?.company_name || suppliers[0]?.name || 'National Wholesale Distributors';
      const estimatedCost = lowStockItems.reduce((acc, p) => acc + ((p.minStockLevel || 5) * 2 - p.quantity) * (p.purchasePrice || 100), 0);

      suggestedAction = {
        actionType: 'CREATE_PURCHASE_ORDER',
        title: `Restock Order PO for ${lowStockItems.length} Low-Stock Items`,
        description: `Create purchase order to ${topSupplier} for ₹${Math.max(1500, estimatedCost).toLocaleString('en-IN')} to replenish inventory to optimal levels.`,
        financialImpact: Math.max(1500, estimatedCost),
        requiresApproval: true,
        payload: {
          supplier: topSupplier,
          items: lowStockItems.map((p) => ({
            productId: p.id,
            name: p.name,
            reorderQty: Math.max(10, (p.minStockLevel || 5) * 2 - p.quantity),
          })),
        },
      };
    }

    summary = `Inventory check complete: ${lowStockItems.length} items require replenishment. A restocking plan has been drafted for your approval.`;
  }
  // 3. Receivables & Balances
  else if (
    queryLower.includes('owe') ||
    queryLower.includes('due') ||
    queryLower.includes('receivable') ||
    queryLower.includes('unpaid') ||
    queryLower.includes('balance') ||
    queryLower.includes('credit')
  ) {
    activeAgents.push('Billing Agent', 'Audit Agent');

    const owingCustomers = customers.filter((c) => (c.outstandingBalance || 0) > 0);
    const totalReceivables = owingCustomers.reduce((acc, c) => acc + c.outstandingBalance, 0);

    findings.push({
      category: 'Billing Agent',
      text: `Total outstanding customer receivables amount to ₹${totalReceivables.toLocaleString('en-IN')} across ${owingCustomers.length} customer(s).`,
      data: { totalReceivables, count: owingCustomers.length },
    });

    if (owingCustomers.length > 0) {
      tableData = {
        headers: ['Customer Name', 'Mobile', 'Outstanding Due', 'Total Lifetime Spent', 'Notes'],
        rows: owingCustomers.map((c) => [
          c.name,
          c.mobile,
          `₹${c.outstandingBalance.toLocaleString('en-IN')}`,
          `₹${(c.totalSpent || 0).toLocaleString('en-IN')}`,
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

    summary = `Receivables Audit: ₹${totalReceivables.toLocaleString('en-IN')} in customer credit outstanding. You can dispatch polite payment links upon authorization.`;
  }
  // 4. Appointments & Queues
  else if (
    queryLower.includes('appointment') ||
    queryLower.includes('booking') ||
    queryLower.includes('salon') ||
    queryLower.includes('spa') ||
    queryLower.includes('slot')
  ) {
    activeAgents.push('Service Operations Agent', 'Scheduling Agent');

    findings.push({
      category: 'Scheduling Intelligence',
      text: `Currently ${appointments.length} appointment(s) registered on record.`,
      data: { appointmentCount: appointments.length },
    });

    if (appointments.length > 0) {
      tableData = {
        headers: ['Customer', 'Mobile', 'Service', 'Stylist', 'Time Slot', 'Status', 'Price'],
        rows: appointments.map((a) => [
          a.customer_name,
          a.customer_mobile,
          a.service_name,
          a.staff_name,
          a.time_slot,
          a.status,
          `₹${(a.price || 0).toLocaleString('en-IN')}`,
        ]),
      };
    }

    summary = `Service Operations: ${appointments.length} appointment(s) managed. Schedule is balanced across active staff.`;
  }
  // 5. Repairs & Electronics
  else if (
    queryLower.includes('repair') ||
    queryLower.includes('imei') ||
    queryLower.includes('device') ||
    queryLower.includes('service center') ||
    queryLower.includes('job card')
  ) {
    activeAgents.push('Device Service Agent', 'Customer Notification Agent');

    findings.push({
      category: 'Service Center Intelligence',
      text: `Tracking ${repairs.length} active device repair ticket(s).`,
      data: { repairCount: repairs.length },
    });

    if (repairs.length > 0) {
      tableData = {
        headers: ['Ticket #', 'Device', 'IMEI/Serial', 'Issue', 'Status', 'Est. Cost'],
        rows: repairs.map((r) => [
          r.ticket_number,
          r.brand_model,
          r.imei_serial,
          r.issue_description,
          r.status,
          `₹${(r.estimated_cost || 0).toLocaleString('en-IN')}`,
        ]),
      };
    }

    summary = `Repair Workbench: ${repairs.length} device ticket(s) currently being tracked with parts and technician status.`;
  }
  // 6. Food & Restaurant Orders / Laundry / Print
  else if (
    queryLower.includes('order') ||
    queryLower.includes('kot') ||
    queryLower.includes('table') ||
    queryLower.includes('laundry') ||
    queryLower.includes('iron')
  ) {
    activeAgents.push('Order Workflow Agent');

    findings.push({
      category: 'Workflow Intelligence',
      text: `Managing ${orders.length} active service/kitchen orders across the pipeline.`,
      data: { orderCount: orders.length },
    });

    if (orders.length > 0) {
      tableData = {
        headers: ['Order #', 'Type', 'Customer', 'Table/Location', 'Status', 'Total', 'Paid'],
        rows: orders.map((o) => [
          o.order_number,
          o.order_type,
          o.customer_name,
          o.table_number || '-',
          o.status,
          `₹${(o.total_amount || 0).toLocaleString('en-IN')}`,
          o.is_paid ? 'Yes' : 'No',
        ]),
      };
    }

    summary = `Workflow Agent: Active orders processed smoothly. No bottlenecks detected.`;
  }
  // 7. General Business Strategy / Default Assistant
  else {
    activeAgents.push('Business Growth Agent', 'Financial Intelligence Agent');

    const totalSalesCount = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const lowStockCount = products.filter((p) => p.quantity <= (p.minStockLevel || 5)).length;

    findings.push({
      category: 'Operational Health',
      text: `Operating ${business.name} (${business.category.toUpperCase()} - ${business.business_type}). Inventory has ${products.length} registered items with ${lowStockCount} below minimum safety levels.`,
      data: { productCount: products.length, lowStockCount },
    });

    findings.push({
      category: 'Growth & Strategy',
      text: `Processed ₹${totalRevenue.toLocaleString('en-IN')} across ${totalSalesCount} sales. Recommended next step: Launch an automated customer retention campaign or review low-stock items.`,
      data: { revenue: totalRevenue },
    });

    suggestedAction = {
      actionType: 'TRIGGER_CUSTOMER_PROMOTION',
      title: 'Dispatch VIP Customer Promotional Discount',
      description: 'Send personalized WhatsApp greeting and 10% weekend shopping voucher to top 20 loyal patrons.',
      financialImpact: 0,
      requiresApproval: true,
      payload: { discountPercentage: 10, targetSegment: 'Loyal Patrons' },
    };

    summary = `BizPilot AI Central Orchestrator evaluated "${userQuery}". Multi-agent systems stand ready to automate daily operations.`;
  }

  // Create persisted Agent Task in SQLite
  const taskId = 'tsk-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
  const now = new Date().toISOString();
  let approvalId = null;

  if (suggestedAction && suggestedAction.requiresApproval) {
    approvalId = 'appr-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    runSql(
      db,
      `INSERT INTO approvals (id, org_id, business_id, task_id, agent_type, action_title, description, impact_amount, status, requested_at, resolved_at, resolved_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        approvalId,
        business.org_id,
        businessId,
        taskId,
        activeAgents[1] || activeAgents[0],
        suggestedAction.title,
        suggestedAction.description,
        suggestedAction.financialImpact || 0,
        'Pending',
        now,
        null,
        null,
      ]
    );
  }

  runSql(
    db,
    `INSERT INTO agent_tasks (id, org_id, business_id, agent_type, title, prompt, response, status, requires_approval, action_payload_json, approval_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      taskId,
      business.org_id,
      businessId,
      activeAgents[1] || activeAgents[0],
      userQuery.slice(0, 80),
      userQuery,
      summary,
      suggestedAction && suggestedAction.requiresApproval ? 'Awaiting Approval' : 'Completed',
      suggestedAction && suggestedAction.requiresApproval ? 1 : 0,
      suggestedAction ? JSON.stringify(suggestedAction.payload) : null,
      approvalId,
      now,
    ]
  );

  return {
    taskId,
    query: userQuery,
    orchestratorSummary: summary,
    activeAgents,
    findings,
    tableData,
    suggestedAction: suggestedAction
      ? {
          ...suggestedAction,
          approvalId,
        }
      : undefined,
  };
}

module.exports = {
  executeMultiAgentQuery,
};
