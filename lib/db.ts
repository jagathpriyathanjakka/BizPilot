import fs from 'fs';
import path from 'path';
import {
  User,
  Organization,
  BusinessProfile,
  Product,
  ServiceItem,
  Customer,
  Supplier,
  Sale,
  Expense,
  StaffMember,
  OrderRecord,
  AppointmentRecord,
  RepairTicketRecord,
  AgentTask,
  ApprovalRequest,
  AuditLog,
  NotificationItem,
  BusinessCategoryKey,
} from './types';
import { generateSeedDataForCategory } from './demo-data';

export interface DatabaseSchema {
  users: User[];
  organizations: Organization[];
  businesses: BusinessProfile[];
  products: Product[];
  services: ServiceItem[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  expenses: Expense[];
  staff: StaffMember[];
  orders: OrderRecord[];
  appointments: AppointmentRecord[];
  repairs: RepairTicketRecord[];
  agentTasks: AgentTask[];
  approvals: ApprovalRequest[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'bizpilot-store.json');

// Memory cache to avoid synchronous disk bottleneck
let cachedDb: DatabaseSchema | null = null;

function ensureDataDirectory() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function initializeDefaultDatabase(): DatabaseSchema {
  // Pre-seed default owner user
  // Password for demo: "Admin123!" (hashed or matched)
  const defaultUser: User = {
    id: 'usr-demo-owner',
    email: 'owner@bizpilot.ai',
    fullName: 'Sunil Kumar',
    mobile: '+91 98765 43210',
    // In our auth helper we support bcrypt, with fallback for default seed
    passwordHash: '$2a$10$wN10g8y2F6wFw7QyF7iQ3.Wj4v3oZf4KzE3A4R5D6E7F8G9H0I1J2', // or handled in auth.ts
    role: 'owner',
    createdAt: new Date().toISOString(),
  };

  const defaultOrg: Organization = {
    id: 'org-demo-1',
    name: 'Om Enterprises Group',
    ownerId: defaultUser.id,
    currency: 'INR',
    country: 'India',
    activeBusinessId: 'biz-grocery-demo',
    createdAt: new Date().toISOString(),
  };

  // Pre-seed Grocery Demo
  const grocerySeed = generateSeedDataForCategory('grocery', defaultOrg.id, 'biz-grocery-demo');

  // Pre-seed Food Demo (so switching between them is instant and rich!)
  const foodSeed = generateSeedDataForCategory('food', defaultOrg.id, 'biz-food-demo');

  // Pre-seed Clothing Demo
  const clothingSeed = generateSeedDataForCategory('clothing', defaultOrg.id, 'biz-clothing-demo');

  // Pre-seed Electronics Demo
  const electronicsSeed = generateSeedDataForCategory('electronics', defaultOrg.id, 'biz-electronics-demo');

  // Pre-seed Salon Demo
  const salonSeed = generateSeedDataForCategory('salon', defaultOrg.id, 'biz-salon-demo');

  return {
    users: [defaultUser],
    organizations: [defaultOrg],
    businesses: [
      grocerySeed.business,
      foodSeed.business,
      clothingSeed.business,
      electronicsSeed.business,
      salonSeed.business,
    ],
    products: [
      ...grocerySeed.products,
      ...foodSeed.products,
      ...clothingSeed.products,
      ...electronicsSeed.products,
      ...salonSeed.products,
    ],
    services: [
      ...grocerySeed.services,
      ...foodSeed.services,
      ...clothingSeed.services,
      ...electronicsSeed.services,
      ...salonSeed.services,
    ],
    customers: [
      ...grocerySeed.customers,
      ...foodSeed.customers,
      ...clothingSeed.customers,
      ...electronicsSeed.customers,
      ...salonSeed.customers,
    ],
    suppliers: [
      ...grocerySeed.suppliers,
      ...foodSeed.suppliers,
      ...clothingSeed.suppliers,
      ...electronicsSeed.suppliers,
      ...salonSeed.suppliers,
    ],
    sales: [
      ...grocerySeed.sales,
      ...foodSeed.sales,
      ...clothingSeed.sales,
      ...electronicsSeed.sales,
      ...salonSeed.sales,
    ],
    expenses: [
      ...grocerySeed.expenses,
      ...foodSeed.expenses,
      ...clothingSeed.expenses,
      ...electronicsSeed.expenses,
      ...salonSeed.expenses,
    ],
    staff: [
      ...grocerySeed.staff,
      ...foodSeed.staff,
      ...clothingSeed.staff,
      ...electronicsSeed.staff,
      ...salonSeed.staff,
    ],
    orders: [
      ...grocerySeed.orders,
      ...foodSeed.orders,
      ...clothingSeed.orders,
      ...electronicsSeed.orders,
      ...salonSeed.orders,
    ],
    appointments: [
      ...grocerySeed.appointments,
      ...foodSeed.appointments,
      ...clothingSeed.appointments,
      ...electronicsSeed.appointments,
      ...salonSeed.appointments,
    ],
    repairs: [
      ...grocerySeed.repairs,
      ...foodSeed.repairs,
      ...clothingSeed.repairs,
      ...electronicsSeed.repairs,
      ...salonSeed.repairs,
    ],
    agentTasks: [
      ...grocerySeed.agentTasks,
      ...foodSeed.agentTasks,
      ...clothingSeed.agentTasks,
      ...electronicsSeed.agentTasks,
      ...salonSeed.agentTasks,
    ],
    approvals: [
      ...grocerySeed.approvals,
      ...foodSeed.approvals,
      ...clothingSeed.approvals,
      ...electronicsSeed.approvals,
      ...salonSeed.approvals,
    ],
    auditLogs: [
      ...grocerySeed.auditLogs,
      ...foodSeed.auditLogs,
      ...clothingSeed.auditLogs,
      ...electronicsSeed.auditLogs,
      ...salonSeed.auditLogs,
    ],
    notifications: [
      ...grocerySeed.notifications,
      ...foodSeed.notifications,
      ...clothingSeed.notifications,
      ...electronicsSeed.notifications,
      ...salonSeed.notifications,
    ],
  };
}

export function getDatabase(): DatabaseSchema {
  if (cachedDb) return cachedDb;

  ensureDataDirectory();

  if (!fs.existsSync(DB_FILE)) {
    const initial = initializeDefaultDatabase();
    saveDatabase(initial);
    cachedDb = initial;
    return cachedDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    cachedDb = JSON.parse(raw);
    return cachedDb!;
  } catch (err) {
    console.error('Failed to read database file, initializing default:', err);
    const initial = initializeDefaultDatabase();
    saveDatabase(initial);
    cachedDb = initial;
    return cachedDb;
  }
}

export function saveDatabase(data: DatabaseSchema): void {
  ensureDataDirectory();
  cachedDb = data;
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to atomically write database file:', err);
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }
}

// ==================== REPOSITORY METHODS ====================

// Users
export function findUserByEmail(email: string): User | undefined {
  const db = getDatabase();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  const db = getDatabase();
  return db.users.find((u) => u.id === id);
}

export function createUser(user: User): User {
  const db = getDatabase();
  db.users.push(user);
  saveDatabase(db);
  return user;
}

// Organizations & Business Profiles
export function getOrganizationById(id: string): Organization | undefined {
  const db = getDatabase();
  return db.organizations.find((o) => o.id === id);
}

export function getUserOrganizations(userId: string): Organization[] {
  const db = getDatabase();
  return db.organizations.filter((o) => o.ownerId === userId);
}

export function createOrganization(org: Organization): Organization {
  const db = getDatabase();
  db.organizations.push(org);
  saveDatabase(db);
  return org;
}

export function updateOrganizationActiveBusiness(orgId: string, businessId: string): void {
  const db = getDatabase();
  const org = db.organizations.find((o) => o.id === orgId);
  if (org) {
    org.activeBusinessId = businessId;
    saveDatabase(db);
  }
}

export function getBusinessesByOrg(orgId: string): BusinessProfile[] {
  const db = getDatabase();
  return db.businesses.filter((b) => b.orgId === orgId);
}

export function getBusinessById(businessId: string): BusinessProfile | undefined {
  const db = getDatabase();
  return db.businesses.find((b) => b.id === businessId);
}

export function createBusiness(business: BusinessProfile): BusinessProfile {
  const db = getDatabase();
  db.businesses.push(business);

  // If org activeBusinessId is empty or matches this, set it
  const org = db.organizations.find((o) => o.id === business.orgId);
  if (org && (!org.activeBusinessId || org.activeBusinessId === '')) {
    org.activeBusinessId = business.id;
  }

  saveDatabase(db);
  return business;
}

export function updateBusiness(businessId: string, updates: Partial<BusinessProfile>): BusinessProfile | null {
  const db = getDatabase();
  const idx = db.businesses.findIndex((b) => b.id === businessId);
  if (idx === -1) return null;
  db.businesses[idx] = { ...db.businesses[idx], ...updates };
  saveDatabase(db);
  return db.businesses[idx];
}

// Products
export function getProducts(businessId: string): Product[] {
  const db = getDatabase();
  return db.products.filter((p) => p.businessId === businessId);
}

export function addProduct(product: Product): Product {
  const db = getDatabase();
  db.products.push(product);
  saveDatabase(db);
  return product;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const db = getDatabase();
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.products[idx] = { ...db.products[idx], ...updates, updatedAt: new Date().toISOString() };
  saveDatabase(db);
  return db.products[idx];
}

export function deleteProduct(id: string): boolean {
  const db = getDatabase();
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  db.products.splice(idx, 1);
  saveDatabase(db);
  return true;
}

// Services
export function getServices(businessId: string): ServiceItem[] {
  const db = getDatabase();
  return db.services.filter((s) => s.businessId === businessId);
}

export function addService(service: ServiceItem): ServiceItem {
  const db = getDatabase();
  db.services.push(service);
  saveDatabase(db);
  return service;
}

// Customers & Suppliers
export function getCustomers(businessId: string): Customer[] {
  const db = getDatabase();
  return db.customers.filter((c) => c.businessId === businessId);
}

export function addCustomer(customer: Customer): Customer {
  const db = getDatabase();
  db.customers.push(customer);
  saveDatabase(db);
  return customer;
}

export function getSuppliers(businessId: string): Supplier[] {
  const db = getDatabase();
  return db.suppliers.filter((s) => s.businessId === businessId);
}

export function addSupplier(supplier: Supplier): Supplier {
  const db = getDatabase();
  db.suppliers.push(supplier);
  saveDatabase(db);
  return supplier;
}

// Sales
export function getSales(businessId: string): Sale[] {
  const db = getDatabase();
  return db.sales.filter((s) => s.businessId === businessId);
}

export function createSale(sale: Sale): Sale {
  const db = getDatabase();
  db.sales.push(sale);

  // Deduct inventory quantities for sold products
  for (const item of sale.items) {
    if (item.productId) {
      const prod = db.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.quantity = Math.max(0, prod.quantity - item.quantity);
        prod.updatedAt = new Date().toISOString();
      }
    }
  }

  // Update customer totalSpent & outstandingBalance if applicable
  if (sale.customerId) {
    const cust = db.customers.find((c) => c.id === sale.customerId);
    if (cust) {
      cust.totalSpent += sale.totalAmount;
      if (sale.paymentStatus === 'Pending' || sale.paymentStatus === 'Partial') {
        const unpaid = sale.totalAmount - sale.amountReceived;
        cust.outstandingBalance += unpaid;
      }
    }
  }

  // Add audit log
  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    orgId: sale.orgId,
    businessId: sale.businessId,
    action: 'SALE_RECORDED',
    entityType: 'Sale',
    entityId: sale.id,
    actorName: sale.staffName || 'Owner',
    actorRole: 'staff',
    details: {
      invoiceNumber: sale.invoiceNumber,
      totalAmount: sale.totalAmount,
      paymentMethod: sale.paymentMethod,
    },
    timestamp: new Date().toISOString(),
  });

  saveDatabase(db);
  return sale;
}

// Expenses
export function getExpenses(businessId: string): Expense[] {
  const db = getDatabase();
  return db.expenses.filter((e) => e.businessId === businessId);
}

export function addExpense(expense: Expense): Expense {
  const db = getDatabase();
  db.expenses.push(expense);

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    orgId: expense.orgId,
    businessId: expense.businessId,
    action: 'EXPENSE_RECORDED',
    entityType: 'Expense',
    entityId: expense.id,
    actorName: expense.recordedBy,
    actorRole: 'owner',
    details: { category: expense.category, amount: expense.amount },
    timestamp: new Date().toISOString(),
  });

  saveDatabase(db);
  return expense;
}

// Staff
export function getStaff(businessId: string): StaffMember[] {
  const db = getDatabase();
  return db.staff.filter((s) => s.businessId === businessId);
}

export function addStaff(member: StaffMember): StaffMember {
  const db = getDatabase();
  db.staff.push(member);
  saveDatabase(db);
  return member;
}

// Orders (Restaurant / Laundry / Xerox / Custom)
export function getOrders(businessId: string): OrderRecord[] {
  const db = getDatabase();
  return db.orders.filter((o) => o.businessId === businessId);
}

export function createOrder(order: OrderRecord): OrderRecord {
  const db = getDatabase();
  db.orders.unshift(order);
  saveDatabase(db);
  return order;
}

export function updateOrderStatus(id: string, status: OrderRecord['status']): OrderRecord | null {
  const db = getDatabase();
  const order = db.orders.find((o) => o.id === id);
  if (!order) return null;
  order.status = status;
  order.updatedAt = new Date().toISOString();
  saveDatabase(db);
  return order;
}

// Appointments (Salon / Spa)
export function getAppointments(businessId: string): AppointmentRecord[] {
  const db = getDatabase();
  return db.appointments.filter((a) => a.businessId === businessId);
}

export function createAppointment(apt: AppointmentRecord): AppointmentRecord {
  const db = getDatabase();
  db.appointments.unshift(apt);
  saveDatabase(db);
  return apt;
}

// Repairs (Electronics / Mobiles)
export function getRepairTickets(businessId: string): RepairTicketRecord[] {
  const db = getDatabase();
  return db.repairs.filter((r) => r.businessId === businessId);
}

export function createRepairTicket(ticket: RepairTicketRecord): RepairTicketRecord {
  const db = getDatabase();
  db.repairs.unshift(ticket);
  saveDatabase(db);
  return ticket;
}

export function updateRepairStatus(id: string, status: RepairTicketRecord['status']): RepairTicketRecord | null {
  const db = getDatabase();
  const tkt = db.repairs.find((r) => r.id === id);
  if (!tkt) return null;
  tkt.status = status;
  saveDatabase(db);
  return tkt;
}

// Agent Tasks & Approvals
export function getAgentTasks(businessId: string): AgentTask[] {
  const db = getDatabase();
  return db.agentTasks.filter((t) => t.businessId === businessId);
}

export function createAgentTask(task: AgentTask): AgentTask {
  const db = getDatabase();
  db.agentTasks.unshift(task);
  saveDatabase(db);
  return task;
}

export function getApprovals(businessId: string): ApprovalRequest[] {
  const db = getDatabase();
  return db.approvals.filter((a) => a.businessId === businessId);
}

export function createApproval(approval: ApprovalRequest): ApprovalRequest {
  const db = getDatabase();
  db.approvals.unshift(approval);
  saveDatabase(db);
  return approval;
}

export function resolveApproval(
  approvalId: string,
  decision: 'Approved' | 'Rejected',
  userId: string = 'Sunil Kumar (Owner)'
): ApprovalRequest | null {
  const db = getDatabase();
  const req = db.approvals.find((a) => a.id === approvalId);
  if (!req) return null;

  req.status = decision;
  req.resolvedAt = new Date().toISOString();
  req.resolvedBy = userId;

  // Also update corresponding AgentTask
  const task = db.agentTasks.find((t) => t.id === req.taskId);
  if (task) {
    task.status = decision === 'Approved' ? 'Approved' : 'Failed';
  }

  // Record in audit log
  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    orgId: req.orgId,
    businessId: req.businessId,
    action: decision === 'Approved' ? 'APPROVAL_GRANTED' : 'APPROVAL_REJECTED',
    entityType: 'ApprovalRequest',
    entityId: req.id,
    actorName: userId,
    actorRole: 'owner',
    details: {
      actionTitle: req.actionTitle,
      impactAmount: req.impactAmount,
    },
    timestamp: new Date().toISOString(),
  });

  saveDatabase(db);
  return req;
}

// Audit Logs
export function getAuditLogs(businessId: string): AuditLog[] {
  const db = getDatabase();
  return db.auditLogs.filter((a) => a.businessId === businessId);
}

// Notifications
export function getNotifications(businessId: string): NotificationItem[] {
  const db = getDatabase();
  return db.notifications.filter((n) => n.businessId === businessId);
}

export function markNotificationAsRead(id: string): void {
  const db = getDatabase();
  const notif = db.notifications.find((n) => n.id === id);
  if (notif) {
    notif.read = true;
    saveDatabase(db);
  }
}

// Reset / Seed Demo for any category on the fly
export function seedCategoryWorkspace(
  category: BusinessCategoryKey,
  orgId: string,
  businessName?: string
): BusinessProfile {
  const db = getDatabase();
  const seed = generateSeedDataForCategory(category, orgId, undefined, businessName);

  db.businesses.push(seed.business);
  db.products.push(...seed.products);
  db.services.push(...seed.services);
  db.customers.push(...seed.customers);
  db.suppliers.push(...seed.suppliers);
  db.sales.push(...seed.sales);
  db.expenses.push(...seed.expenses);
  db.staff.push(...seed.staff);
  db.orders.push(...seed.orders);
  db.appointments.push(...seed.appointments);
  db.repairs.push(...seed.repairs);
  db.agentTasks.push(...seed.agentTasks);
  db.approvals.push(...seed.approvals);
  db.auditLogs.push(...seed.auditLogs);
  db.notifications.push(...seed.notifications);

  // Switch active business in org
  const org = db.organizations.find((o) => o.id === orgId);
  if (org) {
    org.activeBusinessId = seed.business.id;
  }

  saveDatabase(db);
  return seed.business;
}
