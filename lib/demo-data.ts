import {
  BusinessCategoryKey,
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
} from './types';

export interface SeedDataBundle {
  business: BusinessProfile;
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

export function generateSeedDataForCategory(
  category: BusinessCategoryKey,
  orgId: string = 'org-default',
  businessId?: string,
  businessName?: string
): SeedDataBundle {
  const bId = businessId || `biz-${category}-demo`;
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterdayStr = new Date(now.getTime() - 86400000).toISOString().split('T')[0];

  // Helper date generators
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
  const daysAhead = (d: number) => new Date(now.getTime() + d * 86400000).toISOString().split('T')[0];

  // Default common entities
  let bName = businessName;
  let bType = 'Primary Business';

  let products: Product[] = [];
  let services: ServiceItem[] = [];
  let orders: OrderRecord[] = [];
  let appointments: AppointmentRecord[] = [];
  let repairs: RepairTicketRecord[] = [];

  switch (category) {
    case 'grocery': {
      bName = bName || 'Shree Ganesh Supermarket & Kirana';
      bType = 'Supermarket';
      products = [
        {
          id: `${bId}-p1`,
          orgId,
          businessId: bId,
          name: 'Daawat Rozana Basmati Rice',
          barcode: '8901234001',
          sku: 'GRO-RICE-05K',
          category: 'Grains & Staples',
          brand: 'Daawat',
          purchasePrice: 380,
          sellingPrice: 475,
          quantity: 45,
          unit: 'packet',
          minStockLevel: 15,
          expiryDate: daysAhead(180),
          attributes: { batchNumber: 'BCH-2024-R09' },
          createdAt: daysAgo(30),
          updatedAt: daysAgo(1),
        },
        {
          id: `${bId}-p2`,
          orgId,
          businessId: bId,
          name: 'Fortune Sunlite Sunflower Oil 1L',
          barcode: '8901234002',
          sku: 'GRO-OIL-01L',
          category: 'Edible Oils',
          brand: 'Fortune',
          purchasePrice: 122,
          sellingPrice: 145,
          quantity: 6, // Low stock
          unit: 'packet',
          minStockLevel: 12,
          expiryDate: daysAhead(120),
          attributes: { batchNumber: 'OIL-993-B' },
          createdAt: daysAgo(30),
          updatedAt: daysAgo(2),
        },
        {
          id: `${bId}-p3`,
          orgId,
          businessId: bId,
          name: 'Amul Taaza Toned Milk 500ml',
          barcode: '8901234003',
          sku: 'GRO-MILK-500',
          category: 'Dairy & Bakery',
          brand: 'Amul',
          purchasePrice: 24,
          sellingPrice: 28,
          quantity: 2, // Near out of stock & near expiry
          unit: 'packet',
          minStockLevel: 20,
          expiryDate: daysAhead(2), // Near expiry
          attributes: { batchNumber: 'AML-0442' },
          createdAt: daysAgo(2),
          updatedAt: daysAgo(0),
        },
        {
          id: `${bId}-p4`,
          orgId,
          businessId: bId,
          name: 'Aashirvaad Shudh Chakki Atta 10kg',
          barcode: '8901234004',
          sku: 'GRO-ATTA-10K',
          category: 'Grains & Staples',
          brand: 'Aashirvaad',
          purchasePrice: 410,
          sellingPrice: 490,
          quantity: 28,
          unit: 'packet',
          minStockLevel: 10,
          expiryDate: daysAhead(90),
          attributes: { batchNumber: 'ITC-ATT-88' },
          createdAt: daysAgo(25),
          updatedAt: daysAgo(1),
        },
        {
          id: `${bId}-p5`,
          orgId,
          businessId: bId,
          name: 'Tata Salt Vacuum Evaporated 1kg',
          barcode: '8901234005',
          sku: 'GRO-SALT-01K',
          category: 'Spices & Essentials',
          brand: 'Tata Salt',
          purchasePrice: 22,
          sellingPrice: 28,
          quantity: 60,
          unit: 'packet',
          minStockLevel: 25,
          expiryDate: daysAhead(365),
          attributes: { batchNumber: 'TS-2024' },
          createdAt: daysAgo(40),
          updatedAt: daysAgo(5),
        },
        {
          id: `${bId}-p6`,
          orgId,
          businessId: bId,
          name: 'Maggi 2-Minute Masala Noodles 4-Pack',
          barcode: '8901234006',
          sku: 'GRO-MAGG-04P',
          category: 'Snacks & Packaged Food',
          brand: 'Nestle',
          purchasePrice: 52,
          sellingPrice: 60,
          quantity: 0, // Out of stock
          unit: 'packet',
          minStockLevel: 15,
          expiryDate: daysAhead(150),
          attributes: { batchNumber: 'NES-MG-41' },
          createdAt: daysAgo(40),
          updatedAt: daysAgo(1),
        },
      ];
      break;
    }

    case 'hardware': {
      bName = bName || 'Apex Electricals & Hardware Supplies';
      bType = 'Mixed Hardware & Electrical';
      products = [
        {
          id: `${bId}-p1`,
          orgId,
          businessId: bId,
          name: 'Polycab FR Flame Retardant Wire 1.5 sq mm (90m Red)',
          barcode: '8902001001',
          sku: 'ELEC-WIRE-1.5R',
          category: 'Wires & Cables',
          brand: 'Polycab',
          purchasePrice: 1650,
          sellingPrice: 1980,
          quantity: 18,
          unit: 'roll',
          minStockLevel: 5,
          attributes: { size: '1.5 sq mm', color: 'Red', warrantyMonths: 12 },
          createdAt: daysAgo(45),
          updatedAt: daysAgo(2),
        },
        {
          id: `${bId}-p2`,
          orgId,
          businessId: bId,
          name: 'Supreme CPVC Pipe 1 inch SDR 11 (3m)',
          barcode: '8902001002',
          sku: 'PLUMB-CPVC-1IN',
          category: 'Plumbing & Pipes',
          brand: 'Supreme',
          purchasePrice: 320,
          sellingPrice: 420,
          quantity: 42,
          unit: 'piece',
          minStockLevel: 15,
          attributes: { dimensions: '1 inch x 3m', material: 'CPVC SDR 11' },
          createdAt: daysAgo(40),
          updatedAt: daysAgo(3),
        },
        {
          id: `${bId}-p3`,
          orgId,
          businessId: bId,
          name: 'Havells Fabio 16A Modular Switch 1-Way',
          barcode: '8902001003',
          sku: 'ELEC-SW-16A',
          category: 'Switches & Sockets',
          brand: 'Havells',
          purchasePrice: 85,
          sellingPrice: 125,
          quantity: 80,
          unit: 'piece',
          minStockLevel: 30,
          attributes: { warrantyMonths: 24 },
          createdAt: daysAgo(35),
          updatedAt: daysAgo(1),
        },
        {
          id: `${bId}-p4`,
          orgId,
          businessId: bId,
          name: 'Bosch Professional Impact Drill GSB 550W',
          barcode: '8902001004',
          sku: 'TOOL-DRL-550',
          category: 'Power Tools',
          brand: 'Bosch',
          purchasePrice: 2850,
          sellingPrice: 3499,
          quantity: 3,
          unit: 'piece',
          minStockLevel: 2,
          attributes: { warrantyMonths: 12, serialImei: 'BSH-550-9831' },
          createdAt: daysAgo(30),
          updatedAt: daysAgo(4),
        },
      ];
      break;
    }

    case 'agriculture': {
      bName = bName || 'Kisan Seva Kendra & Agro Inputs';
      bType = 'Seeds & Fertilizer Shop';
      products = [
        {
          id: `${bId}-p1`,
          orgId,
          businessId: bId,
          name: 'Kaveri Hybrid Paddy Seeds KPH-467 (3kg)',
          barcode: '8903001001',
          sku: 'AGRO-SEED-KPH',
          category: 'Certified Seeds',
          brand: 'Kaveri Seeds',
          purchasePrice: 720,
          sellingPrice: 850,
          quantity: 35,
          unit: 'bag',
          minStockLevel: 10,
          expiryDate: daysAhead(300),
          attributes: { batchNumber: 'KAV-PD-892', seedPurity: '98.5% Genetic Purity' },
          createdAt: daysAgo(60),
          updatedAt: daysAgo(3),
        },
        {
          id: `${bId}-p2`,
          orgId,
          businessId: bId,
          name: 'IFFCO DAP 18:46:0 Fertilizer (50kg Bag)',
          barcode: '8903001002',
          sku: 'AGRO-FERT-DAP',
          category: 'Chemical Fertilizers',
          brand: 'IFFCO',
          purchasePrice: 1280,
          sellingPrice: 1350,
          quantity: 90,
          unit: 'bag',
          minStockLevel: 25,
          attributes: { fertilizerType: 'Nitrogen 18% + Phosphorus 46%', batchNumber: 'IFF-DAP-2024' },
          createdAt: daysAgo(20),
          updatedAt: daysAgo(1),
        },
        {
          id: `${bId}-p3`,
          orgId,
          businessId: bId,
          name: 'Bayer Confidor Insecticide (100ml)',
          barcode: '8903001003',
          sku: 'AGRO-PEST-CONF',
          category: 'Pesticides & Bio-Controls',
          brand: 'Bayer CropScience',
          purchasePrice: 340,
          sellingPrice: 410,
          quantity: 8,
          unit: 'bottle',
          minStockLevel: 12,
          expiryDate: daysAhead(140),
          attributes: { batchNumber: 'BYR-CF-901', genericName: 'Imidacloprid 17.8% SL' },
          createdAt: daysAgo(40),
          updatedAt: daysAgo(2),
        },
      ];
      break;
    }

    case 'clothing': {
      bName = bName || 'Vogue & Threads Men & Women Boutique';
      bType = 'Readymade Garments & Boutique';
      products = [
        {
          id: `${bId}-p1`,
          orgId,
          businessId: bId,
          name: 'Slim Fit Cotton Casual Shirt (Sky Blue - Size 40)',
          sku: 'CLO-SHIRT-BLU-40',
          category: "Men's Apparel",
          brand: 'Vogue Classics',
          purchasePrice: 550,
          sellingPrice: 1199,
          quantity: 14,
          unit: 'piece',
          minStockLevel: 5,
          attributes: { size: '40 (M)', color: 'Sky Blue', material: '100% Combed Cotton' },
          createdAt: daysAgo(30),
          updatedAt: daysAgo(2),
        },
        {
          id: `${bId}-p2`,
          orgId,
          businessId: bId,
          name: 'Chanderi Silk Anarkali Kurta Set with Dupatta (Teal - Size L)',
          sku: 'CLO-KURTA-TEA-L',
          category: "Women's Ethnic",
          brand: 'Riwaaz Designer',
          purchasePrice: 1450,
          sellingPrice: 2899,
          quantity: 6,
          unit: 'set',
          minStockLevel: 3,
          attributes: { size: 'L', color: 'Teal Green', material: 'Chanderi Silk' },
          createdAt: daysAgo(20),
          updatedAt: daysAgo(1),
        },
        {
          id: `${bId}-p3`,
          orgId,
          businessId: bId,
          name: 'Comfort Fit Stretch Denim Jeans (Dark Indigo - Size 32)',
          sku: 'CLO-JEANS-IND-32',
          category: "Men's Apparel",
          brand: 'DenimCraft',
          purchasePrice: 780,
          sellingPrice: 1699,
          quantity: 19,
          unit: 'piece',
          minStockLevel: 6,
          attributes: { size: '32', color: 'Dark Indigo', material: 'Cotton Elastane Denim' },
          createdAt: daysAgo(40),
          updatedAt: daysAgo(3),
        },
      ];
      break;
    }

    case 'medical': {
      bName = bName || 'LifeCare Chemist & Wellness Pharmacy';
      bType = 'Retail Pharmacy / Chemist';
      products = [
        {
          id: `${bId}-p1`,
          orgId,
          businessId: bId,
          name: 'Augmentin 625 Duo Tablet (Strip of 10)',
          barcode: '8905001001',
          sku: 'MED-AUG-625',
          category: 'Antibiotics',
          brand: 'GSK',
          purchasePrice: 168,
          sellingPrice: 201,
          quantity: 24,
          unit: 'strip',
          minStockLevel: 10,
          expiryDate: daysAhead(210),
          attributes: {
            batchNumber: 'AGM-492',
            genericName: 'Amoxycillin (500mg) + Clavulanic Acid (125mg)',
            dosage: 'Oral BD',
            prescriptionRequired: true,
          },
          createdAt: daysAgo(50),
          updatedAt: daysAgo(1),
        },
        {
          id: `${bId}-p2`,
          orgId,
          businessId: bId,
          name: 'Dolo 650mg Tablet (Strip of 15)',
          barcode: '8905001002',
          sku: 'MED-DOLO-650',
          category: 'Analgesics & Antipyretic',
          brand: 'Micro Labs',
          purchasePrice: 25,
          sellingPrice: 33,
          quantity: 110,
          unit: 'strip',
          minStockLevel: 30,
          expiryDate: daysAhead(365),
          attributes: {
            batchNumber: 'DL-8812',
            genericName: 'Paracetamol 650mg',
            dosage: 'SOS after food',
            prescriptionRequired: false,
          },
          createdAt: daysAgo(60),
          updatedAt: daysAgo(2),
        },
        {
          id: `${bId}-p3`,
          orgId,
          businessId: bId,
          name: 'Pan 40 Tablet (Strip of 15)',
          barcode: '8905001003',
          sku: 'MED-PAN-40',
          category: 'Gastrointestinal',
          brand: 'Alkem Laboratories',
          purchasePrice: 115,
          sellingPrice: 155,
          quantity: 5, // Near low stock
          unit: 'strip',
          minStockLevel: 15,
          expiryDate: daysAhead(45), // Near expiry warning
          attributes: {
            batchNumber: 'PN-0941',
            genericName: 'Pantoprazole Gastro-resistant 40mg',
            prescriptionRequired: true,
          },
          createdAt: daysAgo(35),
          updatedAt: daysAgo(1),
        },
      ];
      break;
    }

    case 'food': {
      bName = bName || 'Spice Route Dine & Cafe Bistro';
      bType = 'Dine-in Restaurant & Cafe';
      products = [
        {
          id: `${bId}-p1`,
          orgId,
          businessId: bId,
          name: 'Paneer Butter Masala Special',
          sku: 'FOD-PBM-01',
          category: 'Main Course (Curries)',
          purchasePrice: 95,
          sellingPrice: 280,
          quantity: 100,
          unit: 'portion',
          minStockLevel: 10,
          attributes: {
            ingredients: [
              { name: 'Fresh Malai Paneer', quantity: '200g' },
              { name: 'Butter & Cream', quantity: '40g' },
              { name: 'Rich Cashew Tomato Gravy', quantity: '250ml' },
            ],
          },
          createdAt: daysAgo(30),
          updatedAt: daysAgo(1),
        },
        {
          id: `${bId}-p2`,
          orgId,
          businessId: bId,
          name: 'Dum Handi Chicken Biryani',
          sku: 'FOD-BRY-CHK',
          category: 'Biryani & Rice',
          purchasePrice: 130,
          sellingPrice: 340,
          quantity: 80,
          unit: 'portion',
          minStockLevel: 15,
          attributes: {
            ingredients: [
              { name: 'Marinated Tender Chicken', quantity: '250g' },
              { name: 'Aged Basmati Rice', quantity: '200g' },
              { name: 'Saffron Milk & Spices', quantity: '10g' },
            ],
          },
          createdAt: daysAgo(30),
          updatedAt: daysAgo(1),
        },
        {
          id: `${bId}-p3`,
          orgId,
          businessId: bId,
          name: 'Artisan Hazelnut Cold Coffee',
          sku: 'FOD-BEV-CFE',
          category: 'Beverages & Mocktails',
          purchasePrice: 40,
          sellingPrice: 160,
          quantity: 120,
          unit: 'cup',
          minStockLevel: 20,
          attributes: {},
          createdAt: daysAgo(30),
          updatedAt: daysAgo(1),
        },
      ];
      orders = [
        {
          id: `${bId}-ord-1`,
          orgId,
          businessId: bId,
          orderNumber: 'KOT-104',
          orderType: 'Dine-in',
          tableNumber: 'Table 4',
          customerName: 'Rahul Verma',
          customerMobile: '9820011223',
          status: 'Preparing',
          items: [
            { name: 'Paneer Butter Masala Special', quantity: 1, price: 280 },
            { name: 'Butter Garlic Naan', quantity: 3, price: 60 },
            { name: 'Artisan Hazelnut Cold Coffee', quantity: 2, price: 160 },
          ],
          totalAmount: 780,
          isPaid: false,
          notes: 'Less spicy in curry, extra crunchy naan',
          createdAt: daysAgo(0.02),
          updatedAt: daysAgo(0.01),
        },
        {
          id: `${bId}-ord-2`,
          orgId,
          businessId: bId,
          orderNumber: 'KOT-103',
          orderType: 'Delivery',
          customerName: 'Pooja Iyer',
          customerMobile: '9845012345',
          deliveryAddress: 'Flat 402, Green Glen Palms, Bellandur',
          status: 'Ready',
          items: [{ name: 'Dum Handi Chicken Biryani', quantity: 2, price: 340 }],
          totalAmount: 680,
          isPaid: true,
          notes: 'Send extra salan and onion raita',
          createdAt: daysAgo(0.05),
          updatedAt: daysAgo(0.02),
        },
      ];
      break;
    }

    case 'stationery': {
      bName = bName || 'Metro Xerox, Print & Documentation Hub';
      bType = 'Combined Xerox & Stationery';
      products = [
        {
          id: `${bId}-p1`,
          orgId,
          businessId: bId,
          name: 'JK Copier A4 Paper 75 GSM (Ream of 500 sheets)',
          barcode: '8907001001',
          sku: 'STAT-JK-A4',
          category: 'Paper & Sheets',
          brand: 'JK Paper',
          purchasePrice: 280,
          sellingPrice: 340,
          quantity: 32,
          unit: 'ream',
          minStockLevel: 10,
          attributes: { paperType: '75 GSM Multipurpose' },
          createdAt: daysAgo(40),
          updatedAt: daysAgo(2),
        },
        {
          id: `${bId}-p2`,
          orgId,
          businessId: bId,
          name: 'Classmate Long Notebook Ruled (172 pages)',
          barcode: '8907001002',
          sku: 'STAT-CLM-BK',
          category: 'Notebooks & Registers',
          brand: 'Classmate',
          purchasePrice: 52,
          sellingPrice: 70,
          quantity: 65,
          unit: 'piece',
          minStockLevel: 20,
          attributes: {},
          createdAt: daysAgo(40),
          updatedAt: daysAgo(1),
        },
      ];
      services = [
        {
          id: `${bId}-s1`,
          orgId,
          businessId: bId,
          name: 'A4 Black & White Xerox / Photocopy',
          category: 'Photocopying',
          price: 2,
          durationMinutes: 1,
          perPageRate: 2,
          paperType: 'A4 75 GSM',
          createdAt: daysAgo(60),
        },
        {
          id: `${bId}-s2`,
          orgId,
          businessId: bId,
          name: 'A4 Color Laser Printing',
          category: 'Digital Color Print',
          price: 10,
          durationMinutes: 2,
          perPageRate: 10,
          paperType: 'A4 Color Bond 100 GSM',
          createdAt: daysAgo(60),
        },
        {
          id: `${bId}-s3`,
          orgId,
          businessId: bId,
          name: 'Spiral & Thermal Project Binding',
          category: 'Binding & Finishing',
          price: 50,
          durationMinutes: 15,
          createdAt: daysAgo(60),
        },
      ];
      orders = [
        {
          id: `${bId}-job-1`,
          orgId,
          businessId: bId,
          orderNumber: 'JOB-209',
          orderType: 'Print Job',
          customerName: 'Engineering College Student (Karthik)',
          customerMobile: '9711223344',
          status: 'Processing',
          items: [
            { name: 'Final Year Project Thesis (85 pages B&W)', quantity: 3, price: 170 },
            { name: 'Hardbound Golden Emboss Cover', quantity: 3, price: 150 },
          ],
          totalAmount: 960,
          isPaid: true,
          notes: 'Customer needs delivery by 4 PM today for submission',
          createdAt: daysAgo(0.1),
          updatedAt: daysAgo(0.05),
        },
      ];
      break;
    }

    case 'salon': {
      bName = bName || 'Luxe Aura Unisex Salon & Day Spa';
      bType = 'Unisex Salon';
      services = [
        {
          id: `${bId}-s1`,
          orgId,
          businessId: bId,
          name: 'Classic Haircut + Beard Styling + Head Massage',
          category: "Men's Grooming",
          price: 499,
          durationMinutes: 45,
          targetGender: 'men',
          createdAt: daysAgo(60),
        },
        {
          id: `${bId}-s2`,
          orgId,
          businessId: bId,
          name: 'O3+ Bridal Glow Facial & De-Tan Spa',
          category: 'Skincare & Facials',
          price: 1899,
          durationMinutes: 75,
          targetGender: 'women',
          createdAt: daysAgo(60),
        },
        {
          id: `${bId}-s3`,
          orgId,
          businessId: bId,
          name: 'Keratin Hair Smoothening Treatment',
          category: 'Hair Treatments',
          price: 3999,
          durationMinutes: 150,
          targetGender: 'unisex',
          createdAt: daysAgo(60),
        },
      ];
      appointments = [
        {
          id: `${bId}-apt-1`,
          orgId,
          businessId: bId,
          customerName: 'Dr. Ananya Sen',
          customerMobile: '9822334455',
          serviceId: `${bId}-s2`,
          serviceName: 'O3+ Bridal Glow Facial & De-Tan Spa',
          staffId: `${bId}-st-2`,
          staffName: 'Megha (Senior Esthetician)',
          date: todayStr,
          timeSlot: '2:30 PM - 3:45 PM',
          status: 'Confirmed',
          price: 1899,
          notes: 'Client has sensitive skin, use aloe soothing serum',
          createdAt: daysAgo(1),
        },
        {
          id: `${bId}-apt-2`,
          orgId,
          businessId: bId,
          customerName: 'Sameer Kapoor',
          customerMobile: '9911223344',
          serviceId: `${bId}-s1`,
          serviceName: 'Classic Haircut + Beard Styling + Head Massage',
          staffId: `${bId}-st-1`,
          staffName: 'Rohan (Master Stylist)',
          date: todayStr,
          timeSlot: '4:00 PM - 4:45 PM',
          status: 'Scheduled',
          price: 499,
          createdAt: daysAgo(2),
        },
      ];
      break;
    }

    case 'travel': {
      bName = bName || 'Voyage Global Holidays & Tours';
      bType = 'Tour Operator & Packages';
      services = [
        {
          id: `${bId}-s1`,
          orgId,
          businessId: bId,
          name: 'Kashmir Paradise: 5N/6D Srinagar, Gulmarg & Pahalgam',
          category: 'Domestic Holiday Packages',
          price: 28500,
          durationMinutes: 8640,
          description: 'Includes 4-star houseboat stay, private Innova transfer, Shikara ride & gondola ticket assistance.',
          createdAt: daysAgo(60),
        },
        {
          id: `${bId}-s2`,
          orgId,
          businessId: bId,
          name: 'Dubai Extravaganza: 4N/5D Desert Safari, Burj Khalifa & Marina Cruise',
          category: 'International Tours',
          price: 45000,
          durationMinutes: 7200,
          description: 'Includes UAE Visa, luxury 4-star hotel with breakfast, airport transfers and city tours.',
          createdAt: daysAgo(60),
        },
      ];
      orders = [
        {
          id: `${bId}-bok-1`,
          orgId,
          businessId: bId,
          orderNumber: 'TRV-8941',
          orderType: 'Custom',
          customerName: 'Rajesh & Suman Gupta (Family of 4)',
          customerMobile: '9810123456',
          status: 'Accepted',
          items: [{ name: 'Kashmir Paradise 5N/6D Tour Package (4 Pax)', quantity: 4, price: 28500 }],
          totalAmount: 114000,
          isPaid: false,
          notes: 'Advance paid Rs 40,000. Balance Rs 74,000 due 5 days before flight.',
          createdAt: daysAgo(3),
          updatedAt: daysAgo(1),
        },
      ];
      break;
    }

    case 'furniture': {
      bName = bName || 'Heritage Teak & Modern Living Furniture';
      bType = 'Home Furniture Showroom & Workshop';
      products = [
        {
          id: `${bId}-p1`,
          orgId,
          businessId: bId,
          name: 'Solid Teak Wood 6-Seater Dining Table Set',
          sku: 'FURN-DINE-TEAK',
          category: 'Dining & Living',
          brand: 'Heritage Wood',
          purchasePrice: 28000,
          sellingPrice: 46999,
          quantity: 4,
          unit: 'set',
          minStockLevel: 2,
          attributes: { material: 'CP Teak Wood with Natural Honey Polish', dimensions: '6ft x 3.5ft x 30in' },
          createdAt: daysAgo(40),
          updatedAt: daysAgo(2),
        },
        {
          id: `${bId}-p2`,
          orgId,
          businessId: bId,
          name: 'L-Shaped Sectional Fabric Sofa (Slate Grey)',
          sku: 'FURN-SOFA-L-GRY',
          category: 'Living Room Seating',
          brand: 'Heritage Living',
          purchasePrice: 19500,
          sellingPrice: 34500,
          quantity: 2,
          unit: 'unit',
          minStockLevel: 1,
          attributes: { color: 'Slate Grey', material: 'High Density Foam + Water Repellent Fabric' },
          createdAt: daysAgo(30),
          updatedAt: daysAgo(5),
        },
      ];
      orders = [
        {
          id: `${bId}-cust-1`,
          orgId,
          businessId: bId,
          orderNumber: 'CUST-WOOD-502',
          orderType: 'Custom',
          customerName: 'Col. Sanjeev Nair',
          customerMobile: '9840019283',
          deliveryAddress: 'Villa 14, Palm Meadows, Whitefield',
          status: 'Processing',
          items: [
            {
              name: 'Custom King Size Hydraulic Storage Bed (Sheesham Wood with Velvet Headboard)',
              quantity: 1,
              price: 48000,
            },
          ],
          totalAmount: 48000,
          isPaid: false,
          notes: 'Carpentry 80% done. Polishing scheduled for Thursday. Delivery booked for Saturday.',
          createdAt: daysAgo(7),
          updatedAt: daysAgo(1),
        },
      ];
      break;
    }

    case 'electronics': {
      bName = bName || 'TechZone Mobiles, Laptops & Care Center';
      bType = 'Mobile Phones, Electronics & Service Center';
      products = [
        {
          id: `${bId}-p1`,
          orgId,
          businessId: bId,
          name: 'Samsung Galaxy A35 5G (8GB RAM, 128GB - Awesome Navy)',
          barcode: '880609123456',
          sku: 'ELEC-SAM-A35',
          category: 'Smartphones',
          brand: 'Samsung',
          purchasePrice: 24500,
          sellingPrice: 27999,
          quantity: 7,
          unit: 'piece',
          minStockLevel: 3,
          attributes: { serialImei: '358921098492019', warrantyMonths: 12 },
          createdAt: daysAgo(25),
          updatedAt: daysAgo(1),
        },
        {
          id: `${bId}-p2`,
          orgId,
          businessId: bId,
          name: 'Apple 20W USB-C Power Adapter (Original)',
          barcode: '194252157022',
          sku: 'ELEC-APL-20W',
          category: 'Accessories & Chargers',
          brand: 'Apple',
          purchasePrice: 1450,
          sellingPrice: 1900,
          quantity: 22,
          unit: 'piece',
          minStockLevel: 8,
          attributes: { warrantyMonths: 12 },
          createdAt: daysAgo(30),
          updatedAt: daysAgo(3),
        },
      ];
      repairs = [
        {
          id: `${bId}-rep-1`,
          orgId,
          businessId: bId,
          ticketNumber: 'TKT-CARE-804',
          customerName: 'Vikram Joshi',
          customerMobile: '9988776655',
          deviceType: 'Smartphone',
          brandModel: 'OnePlus 11R 5G',
          imeiOrSerial: '869201048291045',
          issueDescription: 'Cracked front AMOLED display, touch unresponsive on lower right',
          estimatedCost: 7500,
          status: 'Waiting for Parts',
          technicianNotes: 'Original OLED replacement screen ordered from OEM distributor, arriving tomorrow morning',
          receivedDate: daysAgo(1),
        },
        {
          id: `${bId}-rep-2`,
          orgId,
          businessId: bId,
          ticketNumber: 'TKT-CARE-802',
          customerName: 'Priya Nambiar',
          customerMobile: '9811224466',
          deviceType: 'Laptop',
          brandModel: 'Dell Inspiron 15 5510',
          imeiOrSerial: 'SERV-TAG-7HGK91',
          issueDescription: 'OS not booting, overheating fan noise',
          estimatedCost: 3200,
          finalCost: 3200,
          status: 'Ready for Pickup',
          technicianNotes: 'Cleaned heatsink, re-applied thermal paste, installed 500GB NVMe SSD and restored Windows 11',
          receivedDate: daysAgo(3),
          readyDate: todayStr,
        },
      ];
      break;
    }

    case 'footwear': {
      bName = bName || 'StepUp Footwear & Sports Sneaker Lounge';
      bType = "Men's, Women's & Sports Footwear";
      products = [
        {
          id: `${bId}-p1`,
          orgId,
          businessId: bId,
          name: 'Nike Air Zoom Pegasus Road Running Shoes (UK 9)',
          sku: 'FOOT-NK-PEG-09',
          category: 'Sports & Running',
          brand: 'Nike',
          purchasePrice: 6200,
          sellingPrice: 8995,
          quantity: 6,
          unit: 'pair',
          minStockLevel: 2,
          attributes: { size: 'UK 9 / US 10', color: 'Black/White', material: 'Engineered Mesh' },
          createdAt: daysAgo(30),
          updatedAt: daysAgo(1),
        },
        {
          id: `${bId}-p2`,
          orgId,
          businessId: bId,
          name: 'Hush Puppies Classic Genuine Leather Oxford Formals (UK 8)',
          sku: 'FOOT-HP-OXF-08',
          category: 'Formal Leather Shoes',
          brand: 'Hush Puppies',
          purchasePrice: 2800,
          sellingPrice: 4499,
          quantity: 4,
          unit: 'pair',
          minStockLevel: 2,
          attributes: { size: 'UK 8', color: 'Tan Brown', material: 'Full Grain Leather' },
          createdAt: daysAgo(40),
          updatedAt: daysAgo(2),
        },
      ];
      break;
    }

    case 'laundry': {
      bName = bName || 'SparkleFresh Laundromat & Premium Dry Cleaners';
      bType = 'Retail Laundry & Premium Dry Cleaning';
      services = [
        {
          id: `${bId}-s1`,
          orgId,
          businessId: bId,
          name: 'Wash & Fold Laundry Service (by KG)',
          category: 'Everyday Wash',
          price: 70,
          durationMinutes: 1440,
          createdAt: daysAgo(60),
        },
        {
          id: `${bId}-s2`,
          orgId,
          businessId: bId,
          name: "Men's 2-Piece Business Suit Dry Cleaning",
          category: 'Dry Cleaning',
          price: 350,
          durationMinutes: 2880,
          createdAt: daysAgo(60),
        },
        {
          id: `${bId}-s3`,
          orgId,
          businessId: bId,
          name: 'Silk Saree Delicate Care & Steam Pressing',
          category: 'Ethnic Saree Care',
          price: 220,
          durationMinutes: 1440,
          createdAt: daysAgo(60),
        },
      ];
      orders = [
        {
          id: `${bId}-dry-1`,
          orgId,
          businessId: bId,
          orderNumber: 'LND-901',
          orderType: 'Laundry',
          customerName: 'Amitabh Sen',
          customerMobile: '9833441122',
          status: 'Ironing',
          items: [
            { name: "Men's 2-Piece Suit Dry Cleaning", quantity: 2, price: 350 },
            { name: 'Formal Shirts Wash & Steam Press', quantity: 5, price: 40 },
          ],
          totalAmount: 900,
          isPaid: true,
          deliveryTimeSlot: 'Tomorrow 5:00 PM',
          notes: 'Gentle steam press only, keep on wooden hangers',
          createdAt: daysAgo(1),
          updatedAt: daysAgo(0.2),
        },
      ];
      break;
    }
  }

  // Common Business Profile
  const business: BusinessProfile = {
    id: bId,
    orgId,
    name: bName,
    ownerName: 'Sunil Kumar',
    category,
    businessType: bType,
    mobile: '+91 98765 43210',
    email: `contact@${category}biz.com`,
    address: 'Shop No. 14, Commercial Plaza, M.G. Road',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    pincode: '400001',
    gstin: '27AAAAA0000A1Z5',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    operations: {
      sellsProducts: products.length > 0,
      providesServices: services.length > 0,
      managesInventory: products.length > 0,
      hasEmployees: true,
      hasMultipleBranches: false,
      acceptsCash: true,
      acceptsUpi: true,
      acceptsCards: true,
      acceptsBankTransfer: true,
      offersDelivery: true,
      openingHours: '09:00 AM - 09:30 PM',
    },
    onboardingComplete: true,
    createdAt: daysAgo(60),
  };

  // Common Customers
  const customers: Customer[] = [
    {
      id: `${bId}-c1`,
      orgId,
      businessId: bId,
      name: 'Ramesh Sharma',
      mobile: '+91 98201 12345',
      email: 'ramesh.sharma@gmail.com',
      address: 'B-201, Shanti Niketan, Andheri East, Mumbai',
      totalSpent: 14850,
      outstandingBalance: 0,
      tags: ['Regular', 'Loyal Customer'],
      notes: 'Prefers UPI payment',
      createdAt: daysAgo(45),
    },
    {
      id: `${bId}-c2`,
      orgId,
      businessId: bId,
      name: 'Anita Desai',
      mobile: '+91 98192 67890',
      email: 'anita.desai@yahoo.com',
      address: 'Flat 12, Sunrise Apts, Bandra West',
      totalSpent: 8640,
      outstandingBalance: 450,
      tags: ['Credit Account', 'Family Account'],
      notes: 'Pending balance 450 from last delivery',
      createdAt: daysAgo(30),
    },
    {
      id: `${bId}-c3`,
      orgId,
      businessId: bId,
      name: 'Vikram Patel',
      mobile: '+91 97690 11223',
      address: 'Sector 4, Vashi, Navi Mumbai',
      totalSpent: 22400,
      outstandingBalance: 0,
      tags: ['Wholesale Buyer'],
      createdAt: daysAgo(50),
    },
  ];

  // Common Suppliers
  const suppliers: Supplier[] = [
    {
      id: `${bId}-sup-1`,
      orgId,
      businessId: bId,
      name: 'National Wholesale Distributors Pvt Ltd',
      contactPerson: 'Harish Mehta',
      mobile: '+91 98210 55443',
      email: 'orders@nationaldist.com',
      companyName: 'National Wholesale Distributors',
      gstin: '27AABCN8831Q1ZS',
      paymentTerms: 'Net 15 Days',
      rating: 4.8,
      balanceOwed: 14500,
      createdAt: daysAgo(60),
    },
    {
      id: `${bId}-sup-2`,
      orgId,
      businessId: bId,
      name: 'Prime Goods Logistics & Supply',
      contactPerson: 'Suresh Patil',
      mobile: '+91 98920 33221',
      email: 'supply@primegoods.in',
      companyName: 'Prime Goods Logistics',
      paymentTerms: 'Immediate UPI on Delivery',
      rating: 4.5,
      balanceOwed: 0,
      createdAt: daysAgo(60),
    },
  ];

  // Realistic Sales (Today & Past)
  const sales: Sale[] = [
    {
      id: `${bId}-sale-1`,
      orgId,
      businessId: bId,
      invoiceNumber: 'INV-2024-001',
      customerId: `${bId}-c1`,
      customerName: 'Ramesh Sharma',
      customerMobile: '+91 98201 12345',
      items: [
        {
          name: products[0]?.name || 'Primary Catalog Item',
          sku: products[0]?.sku || 'SKU-001',
          quantity: 2,
          unitPrice: products[0]?.sellingPrice || 500,
          purchaseCost: products[0]?.purchasePrice || 350,
          discount: 0,
          taxRate: 5,
          taxAmount: 50,
          total: (products[0]?.sellingPrice || 500) * 2,
        },
      ],
      subtotal: (products[0]?.sellingPrice || 500) * 2,
      discountAmount: 0,
      taxAmount: 50,
      totalAmount: (products[0]?.sellingPrice || 500) * 2 + 50,
      costOfGoodsSold: (products[0]?.purchasePrice || 350) * 2,
      grossProfit: ((products[0]?.sellingPrice || 500) - (products[0]?.purchasePrice || 350)) * 2,
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      amountReceived: (products[0]?.sellingPrice || 500) * 2 + 50,
      staffName: 'Sunil Kumar (Owner)',
      createdAt: `${todayStr}T09:30:00Z`,
    },
    {
      id: `${bId}-sale-2`,
      orgId,
      businessId: bId,
      invoiceNumber: 'INV-2024-002',
      customerName: 'Walk-in Customer',
      items: [
        {
          name: products[1]?.name || 'Standard Store Item',
          sku: products[1]?.sku || 'SKU-002',
          quantity: 3,
          unitPrice: products[1]?.sellingPrice || 250,
          purchaseCost: products[1]?.purchasePrice || 180,
          discount: 20,
          taxRate: 5,
          taxAmount: 35,
          total: (products[1]?.sellingPrice || 250) * 3 - 20,
        },
      ],
      subtotal: (products[1]?.sellingPrice || 250) * 3,
      discountAmount: 20,
      taxAmount: 35,
      totalAmount: (products[1]?.sellingPrice || 250) * 3 - 20 + 35,
      costOfGoodsSold: (products[1]?.purchasePrice || 180) * 3,
      grossProfit: ((products[1]?.sellingPrice || 250) - (products[1]?.purchasePrice || 180)) * 3 - 20,
      paymentMethod: 'Cash',
      paymentStatus: 'Paid',
      amountReceived: (products[1]?.sellingPrice || 250) * 3 - 20 + 35,
      staffName: 'Manoj (Cashier)',
      createdAt: `${todayStr}T11:15:00Z`,
    },
    {
      id: `${bId}-sale-3`,
      orgId,
      businessId: bId,
      invoiceNumber: 'INV-2024-003',
      customerId: `${bId}-c2`,
      customerName: 'Anita Desai',
      customerMobile: '+91 98192 67890',
      items: [
        {
          name: products[0]?.name || 'Catalog Item',
          quantity: 1,
          unitPrice: products[0]?.sellingPrice || 500,
          purchaseCost: products[0]?.purchasePrice || 350,
          discount: 0,
          taxRate: 5,
          taxAmount: 25,
          total: products[0]?.sellingPrice || 500,
        },
      ],
      subtotal: products[0]?.sellingPrice || 500,
      discountAmount: 0,
      taxAmount: 25,
      totalAmount: (products[0]?.sellingPrice || 500) + 25,
      costOfGoodsSold: products[0]?.purchasePrice || 350,
      grossProfit: (products[0]?.sellingPrice || 500) - (products[0]?.purchasePrice || 350),
      paymentMethod: 'Split',
      paymentStatus: 'Partial',
      amountReceived: (products[0]?.sellingPrice || 500) + 25 - 450,
      staffName: 'Sunil Kumar (Owner)',
      notes: 'Customer paid remainder via credit to pay next week',
      createdAt: `${yesterdayStr}T16:20:00Z`,
    },
  ];

  // Common Expenses
  const expenses: Expense[] = [
    {
      id: `${bId}-exp-1`,
      orgId,
      businessId: bId,
      category: 'Rent',
      description: 'Monthly Shop Commercial Rent for Plaza Unit',
      amount: 18000,
      paymentMethod: 'Bank Transfer',
      paidTo: 'Plaza Management Ltd',
      recordedBy: 'Sunil Kumar',
      date: `${todayStr.slice(0, 7)}-01`,
      createdAt: daysAgo(10),
    },
    {
      id: `${bId}-exp-2`,
      orgId,
      businessId: bId,
      category: 'Utilities',
      description: 'Commercial Electricity & Water Bill',
      amount: 4250,
      paymentMethod: 'UPI',
      paidTo: 'Mahavitaran Discom',
      recordedBy: 'Sunil Kumar',
      date: `${todayStr.slice(0, 7)}-05`,
      createdAt: daysAgo(5),
    },
    {
      id: `${bId}-exp-3`,
      orgId,
      businessId: bId,
      category: 'Logistics & Delivery',
      description: 'Local Delivery Fuel & Packing Materials',
      amount: 1200,
      paymentMethod: 'Cash',
      paidTo: 'City Cargo Delivery',
      recordedBy: 'Manoj',
      date: yesterdayStr,
      createdAt: daysAgo(1),
    },
  ];

  // Staff Members
  const staff: StaffMember[] = [
    {
      id: `${bId}-st-1`,
      orgId,
      businessId: bId,
      name: 'Sunil Kumar',
      mobile: '+91 98765 43210',
      email: 'sunil@bizpilot.ai',
      role: 'owner',
      joiningDate: '2023-01-01',
      status: 'Active',
      salesCount: 142,
      salesTotal: 284000,
      permissions: {
        canBill: true,
        canManageInventory: true,
        canViewReports: true,
        canManageStaff: true,
        canApproveActions: true,
      },
      createdAt: daysAgo(60),
    },
    {
      id: `${bId}-st-2`,
      orgId,
      businessId: bId,
      name: 'Manoj Verma',
      mobile: '+91 98210 99887',
      email: 'manoj.cashier@gmail.com',
      role: 'cashier',
      salary: 16500,
      joiningDate: '2023-06-15',
      status: 'Active',
      salesCount: 89,
      salesTotal: 96500,
      permissions: {
        canBill: true,
        canManageInventory: false,
        canViewReports: false,
        canManageStaff: false,
        canApproveActions: false,
      },
      createdAt: daysAgo(50),
    },
  ];

  // AI Agent Tasks & Proactive Insights
  const agentTasks: AgentTask[] = [
    {
      id: `${bId}-tsk-1`,
      orgId,
      businessId: bId,
      agentType: 'Inventory',
      title: 'Stock Shortage Detected & Auto-Restock Order Drafted',
      prompt: 'Monitor inventory levels and identify items below reorder thresholds',
      response: `Detected ${
        products.filter((p) => p.quantity <= p.minStockLevel).length || 2
      } items falling below safety threshold. Drafted Purchase Order for National Wholesale Distributors.`,
      status: 'Awaiting Approval',
      requiresApproval: true,
      actionPayload: {
        action: 'CREATE_PURCHASE_ORDER',
        entity: 'PurchaseOrder',
        financialImpact: 8400,
        details: {
          supplier: 'National Wholesale Distributors Pvt Ltd',
          items: [
            { item: products[1]?.name || 'Inventory Item A', qty: 24, estCost: 2900 },
            { item: products[2]?.name || 'Inventory Item B', qty: 50, estCost: 5500 },
          ],
        },
      },
      approvalId: `${bId}-appr-1`,
      createdAt: daysAgo(0.1),
    },
    {
      id: `${bId}-tsk-2`,
      orgId,
      businessId: bId,
      agentType: 'Financial',
      title: 'Gross Margin & Cash Flow Health Summary',
      prompt: 'Calculate real month-to-date profit margin, receivables, and payables',
      response:
        'MTD Gross Margin is healthy at 24.8%. Total customer credit owed is ₹450 (Anita Desai). Supplier balance due is ₹14,500 due in 7 days.',
      status: 'Completed',
      requiresApproval: false,
      createdAt: daysAgo(0.3),
    },
  ];

  // Approvals
  const approvals: ApprovalRequest[] = [
    {
      id: `${bId}-appr-1`,
      orgId,
      businessId: bId,
      taskId: `${bId}-tsk-1`,
      agentType: 'Inventory Intelligence Agent',
      actionTitle: 'Restock PO for Low-Stock Items',
      description:
        'Authorize Purchase Order #PO-2024-041 to National Wholesale Distributors for ₹8,400 to prevent stockouts.',
      impactAmount: 8400,
      status: 'Pending',
      requestedAt: daysAgo(0.1),
    },
  ];

  // Audit Logs
  const auditLogs: AuditLog[] = [
    {
      id: `${bId}-aud-1`,
      orgId,
      businessId: bId,
      action: 'SALE_RECORDED',
      entityType: 'Sale',
      entityId: `${bId}-sale-1`,
      actorName: 'Sunil Kumar',
      actorRole: 'owner',
      details: { invoice: 'INV-2024-001', amount: sales[0]?.totalAmount || 1050, payment: 'UPI' },
      timestamp: `${todayStr}T09:30:00Z`,
    },
    {
      id: `${bId}-aud-2`,
      orgId,
      businessId: bId,
      action: 'EXPENSE_LOGGED',
      entityType: 'Expense',
      actorName: 'Sunil Kumar',
      actorRole: 'owner',
      details: { category: 'Utilities', amount: 4250 },
      timestamp: `${todayStr.slice(0, 7)}-05T12:00:00Z`,
    },
    {
      id: `${bId}-aud-3`,
      orgId,
      businessId: bId,
      action: 'AI_RESTOCK_PLAN_PREPARED',
      entityType: 'AgentTask',
      actorName: 'Inventory Intelligence Agent',
      actorRole: 'system_ai',
      details: { itemsFlagged: 2, estimatedCost: 8400 },
      timestamp: daysAgo(0.1),
    },
  ];

  // Notifications
  const notifications: NotificationItem[] = [
    {
      id: `${bId}-notif-1`,
      orgId,
      businessId: bId,
      title: 'Action Awaiting Approval',
      message: 'Inventory Agent prepared a ₹8,400 restock order for low-stock items. Review in AI Approvals.',
      type: 'warning',
      read: false,
      createdAt: daysAgo(0.1),
      link: '/approvals',
    },
    {
      id: `${bId}-notif-2`,
      orgId,
      businessId: bId,
      title: 'Payment Received',
      message: 'Sale #INV-2024-001 of ₹1,050 marked paid via UPI instant settlement.',
      type: 'success',
      read: true,
      createdAt: `${todayStr}T09:31:00Z`,
      link: '/sales',
    },
  ];

  return {
    business,
    products,
    services,
    customers,
    suppliers,
    sales,
    expenses,
    staff,
    orders,
    appointments,
    repairs,
    agentTasks,
    approvals,
    auditLogs,
    notifications,
  };
}
