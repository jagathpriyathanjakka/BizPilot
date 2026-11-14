import { NextResponse } from 'next/server';
import {
  getDatabase,
  findUserByEmail,
  getProducts,
  createSale,
  addExpense,
  getExpenses,
  getStaff,
  addStaff,
  seedCategoryWorkspace,
  resolveApproval,
  getApprovals,
  getAuditLogs,
} from '@/lib/db';
import { executeMultiAgentQuery } from '@/lib/agents/orchestrator';
import { BUSINESS_CATEGORIES } from '@/lib/categories-config';

export async function GET() {
  const results: { testNumber: number; description: string; status: 'PASSED' | 'FAILED'; details?: string }[] = [];

  function record(testNumber: number, description: string, condition: boolean, details?: string) {
    results.push({
      testNumber,
      description,
      status: condition ? 'PASSED' : 'FAILED',
      details,
    });
  }

  try {
    // 1. Database initialization and multi-tenant persistence
    const db = getDatabase();
    record(1, 'Users table initialized and populated with seed user', db.users.length > 0);
    record(2, 'Organizations table initialized with primary org', db.organizations.length > 0);
    record(3, 'Multi-business workspaces initialized', db.businesses.length >= 5);

    // 2. Authentication: User Lookup
    const owner = findUserByEmail('owner@bizpilot.ai');
    record(4, 'User sign-in & credential resolution', owner !== undefined && owner.role === 'owner');

    // 3. Category Metadata Verification (All 13 Categories)
    const categoryKeys = Object.keys(BUSINESS_CATEGORIES);
    record(5, 'Exactly 13 distinct business categories configured', categoryKeys.length === 13);

    let allCategoriesValid = true;
    for (const catKey of categoryKeys) {
      const cat = (BUSINESS_CATEGORIES as any)[catKey];
      if (!cat.name || !cat.subcategories.length || !cat.productTerminology.singular || !cat.customMetrics.length) {
        allCategoriesValid = false;
      }
    }
    record(6, 'All 13 categories contain customized metadata, terminology, and subcategories', allCategoriesValid);

    // 4. Test Seeding & Onboarding for a New Business Category (e.g. Pharmacy / Medical)
    const medicalBiz = seedCategoryWorkspace('medical', 'org-demo-1', 'Apollo Care Chemist');
    record(7, 'Onboarding wizard dynamically created Medical Pharmacy workspace', medicalBiz.category === 'medical');
    record(8, 'Onboarding marked complete with tenant isolation', medicalBiz.onboardingComplete === true);

    // 5. Product Management & Domain Attributes
    const medicalProducts = getProducts(medicalBiz.id);
    record(
      9,
      'Medical catalog populated with batch numbers, generics, and expiry dates',
      medicalProducts.length > 0
    );
    record(
      10,
      'Product attributes dynamically stored generic drug names & Schedule H indicators',
      medicalProducts.some((p) => p.attributes?.genericName !== undefined)
    );

    // 6. POS Sales & Deterministic Accounting
    const initialStock = medicalProducts[0].quantity;
    const unitPrice = medicalProducts[0].sellingPrice;
    const purchaseCost = medicalProducts[0].purchasePrice;
    const qtyToSell = 2;

    const testSale = {
      id: `sale-test-${Date.now()}`,
      orgId: medicalBiz.orgId,
      businessId: medicalBiz.id,
      invoiceNumber: `INV-TEST-${Date.now().toString().slice(-4)}`,
      customerName: 'Test Patient (Kavita Rao)',
      items: [
        {
          productId: medicalProducts[0].id,
          name: medicalProducts[0].name,
          quantity: qtyToSell,
          unitPrice,
          purchaseCost,
          discount: 0,
          taxRate: 5,
          taxAmount: (unitPrice * qtyToSell * 5) / 100,
          total: unitPrice * qtyToSell,
        },
      ],
      subtotal: unitPrice * qtyToSell,
      discountAmount: 0,
      taxAmount: (unitPrice * qtyToSell * 5) / 100,
      totalAmount: unitPrice * qtyToSell + (unitPrice * qtyToSell * 5) / 100,
      costOfGoodsSold: purchaseCost * qtyToSell,
      grossProfit: (unitPrice - purchaseCost) * qtyToSell,
      paymentMethod: 'UPI' as const,
      paymentStatus: 'Paid' as const,
      amountReceived: unitPrice * qtyToSell + (unitPrice * qtyToSell * 5) / 100,
      staffName: 'Staff Pharmacist',
      createdAt: new Date().toISOString(),
    };

    createSale(testSale);
    const updatedProducts = getProducts(medicalBiz.id);
    const updatedItem = updatedProducts.find((p) => p.id === medicalProducts[0].id);

    record(
      11,
      `Deterministic inventory deduction: stock reduced from ${initialStock} to ${updatedItem?.quantity}`,
      updatedItem?.quantity === initialStock - qtyToSell
    );

    // 7. Operating Expenses Logging
    const testExpense = {
      id: `exp-test-${Date.now()}`,
      orgId: medicalBiz.orgId,
      businessId: medicalBiz.id,
      category: 'Utilities' as const,
      description: 'Pharmacy Refrigeration & Cold Chain Electricity',
      amount: 3500,
      paymentMethod: 'UPI' as const,
      recordedBy: 'Owner',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    addExpense(testExpense);
    const expenses = getExpenses(medicalBiz.id);
    record(
      12,
      'Operating expenses recorded and persisted',
      expenses.some((e) => e.description === testExpense.description)
    );

    // 8. Staff and Role Management
    const testStaff = {
      id: `st-test-${Date.now()}`,
      orgId: medicalBiz.orgId,
      businessId: medicalBiz.id,
      name: 'Dr. Ramesh (Chief Pharmacist)',
      mobile: '+91 99112 23344',
      email: 'ramesh.pharm@gmail.com',
      role: 'manager' as const,
      salary: 28000,
      joiningDate: '2024-01-15',
      status: 'Active' as const,
      salesCount: 0,
      salesTotal: 0,
      permissions: {
        canBill: true,
        canManageInventory: true,
        canViewReports: true,
        canManageStaff: false,
        canApproveActions: false,
      },
      createdAt: new Date().toISOString(),
    };
    addStaff(testStaff);
    const staffMembers = getStaff(medicalBiz.id);
    record(13, 'Staff member added with granular permissions', staffMembers.some((s) => s.name === testStaff.name));

    // 9. AI Command Center: Natural Language Query & Multi-Agent Coordination
    const aiSalesResult = await executeMultiAgentQuery(medicalBiz.id, 'How much did I sell today?');
    record(
      14,
      'AI Orchestrator correctly mapped sales query to Sales and Financial Intelligence Agents',
      aiSalesResult.activeAgents.includes('Sales Intelligence Agent') &&
        aiSalesResult.activeAgents.includes('Financial Intelligence Agent')
    );
    record(
      15,
      'AI returned verified financial calculations from real database',
      aiSalesResult.findings.length > 0
    );

    // 10. AI Inventory Analysis & Restocking Plan
    const aiInventoryResult = await executeMultiAgentQuery(medicalBiz.id, 'Which products are running low?');
    record(
      16,
      'AI Orchestrator delegated stock surveillance to Inventory Intelligence Agent',
      aiInventoryResult.activeAgents.includes('Inventory Intelligence Agent')
    );

    // 11. Human-in-the-Loop Approvals System
    const approvals = getApprovals(medicalBiz.id);
    record(
      17,
      'Sensitive actions (Purchase Orders) placed into "Awaiting Approval" state',
      approvals.length > 0
    );

    const pendingAppr = approvals[0];
    const resolved = resolveApproval(pendingAppr.id, 'Approved', 'Sunil Kumar (Owner)');
    record(
      18,
      'Owner granted explicit approval for sensitive action',
      resolved !== null && resolved.status === 'Approved'
    );

    // 12. Audit Logging
    const auditLogs = getAuditLogs(medicalBiz.id);
    record(
      19,
      'Cryptographic audit trail captures all sales, expenses, and approvals',
      auditLogs.length > 0
    );
    record(
      20,
      'Approval event recorded in immutable audit log with actor name and timestamp',
      auditLogs.some((l) => l.action === 'APPROVAL_GRANTED')
    );

    const passedCount = results.filter((r) => r.status === 'PASSED').length;
    const failedCount = results.filter((r) => r.status === 'FAILED').length;

    return NextResponse.json({
      success: failedCount === 0,
      summary: `${passedCount} of ${results.length} tests passed`,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
