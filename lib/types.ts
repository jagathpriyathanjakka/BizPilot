export type BusinessCategoryKey =
  | 'grocery'
  | 'hardware'
  | 'agriculture'
  | 'clothing'
  | 'medical'
  | 'food'
  | 'stationery'
  | 'salon'
  | 'travel'
  | 'furniture'
  | 'electronics'
  | 'footwear'
  | 'laundry';

export interface BusinessCategoryDef {
  key: BusinessCategoryKey;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  subcategories: string[];
  productTerminology: {
    singular: string;
    plural: string;
    stockUnit: string;
    commonUnits: string[];
  };
  features: {
    hasInventory: boolean;
    hasExpiry: boolean;
    hasBatchNumbers: boolean;
    hasVariants: boolean;
    hasServices: boolean;
    hasOrders: boolean;
    hasTables: boolean;
    hasAppointments: boolean;
    hasRepairTickets: boolean;
    hasCustomOrders: boolean;
    hasPackages: boolean;
    hasMachines: boolean;
    hasPrescriptions: boolean;
  };
  customMetrics: {
    key: string;
    label: string;
    format: 'currency' | 'number' | 'percentage' | 'text';
    icon: string;
  }[];
}

export type UserRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'cashier'
  | 'sales_staff'
  | 'inventory_manager'
  | 'custom';

export interface User {
  id: string;
  email: string;
  fullName: string;
  mobile: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  currency: string;
  country: string;
  activeBusinessId: string;
  createdAt: string;
}

export interface BusinessProfile {
  id: string;
  orgId: string;
  name: string;
  ownerName: string;
  category: BusinessCategoryKey;
  businessType: string;
  additionalTypes?: string[];
  mobile: string;
  email: string;
  address: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  registrationNumber?: string;
  gstin?: string;
  currency: string;
  timezone: string;
  logoUrl?: string;
  openingDate?: string;
  operations: {
    sellsProducts: boolean;
    providesServices: boolean;
    managesInventory: boolean;
    hasEmployees: boolean;
    hasMultipleBranches: boolean;
    acceptsCash: boolean;
    acceptsUpi: boolean;
    acceptsCards: boolean;
    acceptsBankTransfer: boolean;
    offersDelivery: boolean;
    openingHours: string;
  };
  onboardingComplete: boolean;
  createdAt: string;
}

export interface Branch {
  id: string;
  orgId: string;
  businessId: string;
  name: string;
  address: string;
  city: string;
  mobile: string;
  isMain: boolean;
}

export interface Product {
  id: string;
  orgId: string;
  businessId: string;
  branchId?: string;
  name: string;
  barcode?: string;
  sku: string;
  category: string;
  brand?: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  unit: string;
  minStockLevel: number;
  supplierId?: string;
  supplierName?: string;
  expiryDate?: string;
  description?: string;
  image?: string;
  // Dynamic business-specific attributes
  attributes: {
    batchNumber?: string;
    genericName?: string;
    dosage?: string;
    prescriptionRequired?: boolean;
    size?: string;
    color?: string;
    material?: string;
    dimensions?: string;
    warrantyMonths?: number;
    serialImei?: string;
    paperType?: string;
    seedPurity?: string;
    fertilizerType?: string;
    machineModel?: string;
    recipeYield?: string;
    ingredients?: { name: string; quantity: string }[];
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: string;
  orgId: string;
  businessId: string;
  name: string;
  category: string;
  price: number;
  durationMinutes: number;
  description?: string;
  targetGender?: 'unisex' | 'men' | 'women' | 'all';
  paperType?: string;
  perPageRate?: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  orgId: string;
  businessId: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  totalSpent: number;
  outstandingBalance: number;
  tags?: string[];
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  orgId: string;
  businessId: string;
  name: string;
  contactPerson?: string;
  mobile: string;
  email?: string;
  address?: string;
  companyName: string;
  gstin?: string;
  paymentTerms?: string;
  productsSupplied?: string[];
  rating?: number;
  balanceOwed: number;
  createdAt: string;
}

export interface SaleItem {
  productId?: string;
  serviceId?: string;
  name: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  purchaseCost: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  attributes?: Record<string, any>;
}

export interface Sale {
  id: string;
  orgId: string;
  businessId: string;
  branchId?: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerMobile?: string;
  items: SaleItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  costOfGoodsSold: number;
  grossProfit: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Split' | 'Pending';
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  amountReceived: number;
  staffId?: string;
  staffName?: string;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  orgId: string;
  businessId: string;
  category:
    | 'Rent'
    | 'Utilities'
    | 'Salaries'
    | 'Raw Materials & Supplies'
    | 'Maintenance'
    | 'Logistics & Delivery'
    | 'Marketing'
    | 'Taxes & Licenses'
    | 'Other';
  description: string;
  amount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card';
  paidTo?: string;
  recordedBy: string;
  date: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  orgId: string;
  businessId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'Draft' | 'Awaiting Approval' | 'Approved' | 'Sent' | 'Received' | 'Cancelled';
  expectedDeliveryDate?: string;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  orgId: string;
  businessId: string;
  name: string;
  mobile: string;
  email: string;
  role: UserRole;
  salary?: number;
  joiningDate: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  salesCount: number;
  salesTotal: number;
  permissions: {
    canBill: boolean;
    canManageInventory: boolean;
    canViewReports: boolean;
    canManageStaff: boolean;
    canApproveActions: boolean;
  };
  createdAt: string;
}

export interface OrderRecord {
  id: string;
  orgId: string;
  businessId: string;
  orderNumber: string;
  orderType: 'Dine-in' | 'Takeaway' | 'Delivery' | 'Custom' | 'Laundry' | 'Print Job';
  customerName: string;
  customerMobile?: string;
  tableNumber?: string;
  status:
    | 'New'
    | 'Accepted'
    | 'Preparing'
    | 'Ready'
    | 'Completed'
    | 'Cancelled'
    | 'Received'
    | 'Processing'
    | 'Washing'
    | 'Ironing'
    | 'Out for Delivery'
    | 'Delivered';
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
  }>;
  totalAmount: number;
  isPaid: boolean;
  deliveryAddress?: string;
  deliveryTimeSlot?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentRecord {
  id: string;
  orgId: string;
  businessId: string;
  customerName: string;
  customerMobile: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  date: string;
  timeSlot: string;
  status: 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  price: number;
  notes?: string;
  createdAt: string;
}

export interface RepairTicketRecord {
  id: string;
  orgId: string;
  businessId: string;
  ticketNumber: string;
  customerName: string;
  customerMobile: string;
  deviceType: string;
  brandModel: string;
  imeiOrSerial: string;
  issueDescription: string;
  estimatedCost: number;
  finalCost?: number;
  status: 'Received' | 'Diagnosing' | 'Waiting for Parts' | 'In Repair' | 'Ready for Pickup' | 'Delivered';
  technicianNotes?: string;
  receivedDate: string;
  readyDate?: string;
}

export interface AgentTask {
  id: string;
  orgId: string;
  businessId: string;
  agentType:
    | 'Orchestrator'
    | 'Inventory'
    | 'Sales'
    | 'Financial'
    | 'Supplier'
    | 'Billing'
    | 'Operations'
    | 'Audit';
  title: string;
  prompt: string;
  response: string;
  status: 'Suggested' | 'Awaiting Approval' | 'Approved' | 'Executing' | 'Completed' | 'Failed';
  requiresApproval: boolean;
  actionPayload?: {
    action: string;
    entity: string;
    details: Record<string, any>;
    financialImpact?: number;
  };
  approvalId?: string;
  createdAt: string;
}

export interface ApprovalRequest {
  id: string;
  orgId: string;
  businessId: string;
  taskId: string;
  agentType: string;
  actionTitle: string;
  description: string;
  impactAmount?: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  executionResult?: string;
}

export interface AuditLog {
  id: string;
  orgId: string;
  businessId: string;
  action: string;
  entityType: string;
  entityId?: string;
  actorName: string;
  actorRole: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  orgId: string;
  businessId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  read: boolean;
  createdAt: string;
  link?: string;
}
