const { z } = require('zod');

const signUpSchema = z.object({
  fullName: z.string().optional().default('Business Owner'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().optional().default(''),
  password: z.string().optional().default(''),
});

const signInSchema = z.object({
  emailOrMobile: z.string().min(1, 'Email is required'),
  password: z.string().optional().default(''),
});

const onboardingSchema = z.object({
  businessInfo: z.object({
    name: z.string().min(2, 'Business name is required'),
    ownerName: z.string().optional(),
    mobile: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
    country: z.string().default('India'),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    gstin: z.string().optional(),
    currency: z.string().default('INR'),
    timezone: z.string().default('Asia/Kolkata'),
  }),
  category: z.string().min(1, 'Business category is required'),
  businessType: z.string().min(1, 'Business subcategory is required'),
  operations: z.record(z.any()).optional(),
  seedDemo: z.boolean().default(true),
});

const productSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  name: z.string().min(1, 'Product name is required'),
  sellingPrice: z.number().nonnegative('Selling price must be positive'),
  purchasePrice: z.number().nonnegative().optional().default(0),
  quantity: z.number().nonnegative().optional().default(0),
  unit: z.string().default('piece'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minStockLevel: z.number().optional().default(5),
  expiryDate: z.string().optional(),
  attributes: z.record(z.any()).optional().default({}),
});

const saleSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  customerName: z.string().default('Walk-in Customer'),
  customerMobile: z.string().optional(),
  items: z.array(
    z.object({
      name: z.string(),
      productId: z.string().optional(),
      quantity: z.number().positive(),
      unitPrice: z.number().nonnegative(),
      purchaseCost: z.number().optional().default(0),
      discount: z.number().optional().default(0),
    })
  ).min(1, 'At least one item is required in a sale'),
  discountAmount: z.number().optional().default(0),
  taxRate: z.number().optional().default(0),
  paymentMethod: z.enum(['Cash', 'UPI', 'Card', 'Bank Transfer', 'Split', 'Pending']).default('UPI'),
  amountReceived: z.number().optional(),
  staffName: z.string().default('Owner'),
  notes: z.string().optional(),
});

const expenseSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  category: z.string().default('Other'),
  description: z.string().min(2, 'Description is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  paymentMethod: z.string().default('UPI'),
  paidTo: z.string().optional(),
  date: z.string().optional(),
});

function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
      }
      return res.status(400).json({ error: 'Malformed request payload' });
    }
  };
}

module.exports = {
  validate,
  signUpSchema,
  signInSchema,
  onboardingSchema,
  productSchema,
  saleSchema,
  expenseSchema,
};
