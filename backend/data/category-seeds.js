// 13 Business Categories Metadata and Demo Seeds for BizPilot AI

const CATEGORIES_META = {
  grocery: {
    key: 'grocery',
    name: 'Grocery Store',
    tagline: 'Fast barcode billing, batch expiry tracking & automated kirana replenishment',
    subcategories: ['General Grocery', 'Supermarket', 'Kirana Shop', 'Wholesale Grocery', 'Provision Store'],
    stockUnit: 'kg',
    commonUnits: ['kg', 'gram', 'litre', 'packet', 'piece', 'box'],
    defaultName: 'Shree Ganesh Supermarket & Kirana',
    defaultType: 'Supermarket',
    features: { inventory: true, expiry: true, batches: true, tables: false, appointments: false, repairs: false, orders: false }
  },
  hardware: {
    key: 'hardware',
    name: 'Electrical, Hardware & Plumbing',
    tagline: 'Technical specs, contractor billing & multi-brand hardware stock',
    subcategories: ['Electrical Shop', 'Hardware Store', 'Plumbing Supplies', 'Electrical & Hardware Wholesale', 'Paints & Sanitaryware'],
    stockUnit: 'piece',
    commonUnits: ['piece', 'meter', 'roll', 'bundle', 'box', 'set'],
    defaultName: 'Jai Bharat Hardware & Electricals',
    defaultType: 'Mixed Hardware & Electrical',
    features: { inventory: true, expiry: false, batches: false, tables: false, appointments: false, repairs: false, orders: false }
  },
  agriculture: {
    key: 'agriculture',
    name: 'Agriculture Business',
    tagline: 'Seasonality-aware fertilizer, seed batch tracking & farmer khata credit ledger',
    subcategories: ['Seeds Shop', 'Fertilizer Shop', 'Pesticide & Agrochemicals', 'Farming Equipment', 'Agri Distribution'],
    stockUnit: 'bag',
    commonUnits: ['bag', 'kg', 'litre', 'bottle', 'packet', 'quintal'],
    defaultName: 'Kisan Seva Kendra & Agro Agencies',
    defaultType: 'Fertilizer & Seeds Shop',
    features: { inventory: true, expiry: true, batches: true, tables: false, appointments: false, repairs: false, orders: false }
  },
  clothing: {
    key: 'clothing',
    name: 'Clothing & Fashion',
    tagline: 'Size-color variant matrices, barcode tags, seasonal fashion & exchange slips',
    subcategories: ["Men's Wear", "Women's Ethnic & Western", "Kids' Wear", 'Designer Boutique', 'Readymade Garments', 'Garment Wholesale'],
    stockUnit: 'piece',
    commonUnits: ['piece', 'set', 'pair', 'meter'],
    defaultName: 'Royal Silk & Fashion Trendz',
    defaultType: 'Readymade Garments',
    features: { inventory: true, expiry: false, batches: false, tables: false, appointments: false, repairs: false, orders: false }
  },
  medical: {
    key: 'medical',
    name: 'Medical Shop & Pharmacy',
    tagline: 'Strict Schedule H/X compliance, batch expiry surveillance & generic salt finder',
    subcategories: ['Retail Pharmacy', 'Medical & General Store', 'Surgical & Healthcare Supplies', 'Ayurvedic Pharmacy', 'Pharma Wholesale'],
    stockUnit: 'strip',
    commonUnits: ['strip', 'bottle', 'box', 'tube', 'piece', 'sachet'],
    defaultName: 'Sanjeevani Medicos & Healthcare',
    defaultType: 'Retail Pharmacy',
    features: { inventory: true, expiry: true, batches: true, tables: false, appointments: false, repairs: false, orders: false }
  },
  food: {
    key: 'food',
    name: 'Restaurant, Cafe & Food',
    tagline: 'Live Kitchen Order Tickets (KOT), dine-in table layout & dynamic menu management',
    subcategories: ['Fine Dining Restaurant', 'Cafe & Bistro', 'Fast Food & Quick Service (QSR)', 'Bakery & Confectionery', 'Cloud Kitchen', 'Sweet Shop / Mithai'],
    stockUnit: 'portion',
    commonUnits: ['portion', 'plate', 'piece', 'cup', 'kg', 'glass'],
    defaultName: 'Urban Spice Bistro & Cafe',
    defaultType: 'Cafe & Bistro',
    features: { inventory: true, expiry: true, batches: false, tables: true, appointments: false, repairs: false, orders: true }
  },
  stationery: {
    key: 'stationery',
    name: 'Stationery & Xerox',
    tagline: 'Print-per-page counter billing, office bulk packages & school supplies',
    subcategories: ['Bookstore & School Supplies', 'Commercial Xerox & Digital Printing', 'Office Stationery Store', 'Wholesale Paper & Printing'],
    stockUnit: 'piece',
    commonUnits: ['piece', 'ream', 'page', 'pack', 'box', 'set'],
    defaultName: 'Universal Stationery & Xerox Hub',
    defaultType: 'Commercial Xerox & Digital Printing',
    features: { inventory: true, expiry: false, batches: false, tables: false, appointments: false, repairs: false, orders: true }
  },
  salon: {
    key: 'salon',
    name: 'Salon & Beauty Spa',
    tagline: 'Stylist appointment diary, service catalog & consumable chemical usage logs',
    subcategories: ['Unisex Hair Salon', 'Luxury Beauty Parlour & Spa', "Men's Grooming Lounge", 'Nail & Makeup Studio'],
    stockUnit: 'session',
    commonUnits: ['session', 'service', 'hour', 'bottle', 'kit'],
    defaultName: 'Glamour Lounge Unisex Salon & Spa',
    defaultType: 'Unisex Hair Salon',
    features: { inventory: true, expiry: false, batches: false, tables: false, appointments: true, repairs: false, orders: false }
  },
  travel: {
    key: 'travel',
    name: 'Tours & Travel Agency',
    tagline: 'Custom holiday itinerary builder, booking vouchers & flight/hotel ticketing',
    subcategories: ['Domestic & International Tour Operator', 'Corporate Travel Agency', 'Pilgrimage & Group Tour Specialist', 'Visa & Flight Ticketing Hub'],
    stockUnit: 'package',
    commonUnits: ['package', 'ticket', 'pax', 'day', 'trip'],
    defaultName: 'Wanderlust Global Holidays',
    defaultType: 'Domestic & International Tour Operator',
    features: { inventory: false, expiry: false, batches: false, tables: false, appointments: true, repairs: false, orders: true }
  },
  furniture: {
    key: 'furniture',
    name: 'Furniture & Woodwork',
    tagline: 'Custom carpentry job tracking, delivery scheduling & showroom showroom display',
    subcategories: ['Home Furniture Showroom', 'Office & Commercial Furniture', 'Custom Carpentry & Modular Kitchens', 'Wooden Handicrafts & Decor'],
    stockUnit: 'unit',
    commonUnits: ['unit', 'set', 'piece', 'sq.ft'],
    defaultName: 'Heritage Wood Craft & Living',
    defaultType: 'Home Furniture Showroom',
    features: { inventory: true, expiry: false, batches: false, tables: false, appointments: false, repairs: false, orders: true }
  },
  electronics: {
    key: 'electronics',
    name: 'Electronics & Mobile Shop',
    tagline: 'IMEI/Serial number tracking, technician repair tickets & accessory cross-selling',
    subcategories: ['Mobile Smartphone & Accessory Store', 'Consumer Electronics & Appliances', 'Computer & Laptop Care Center', 'Mobile Repair Workshop'],
    stockUnit: 'piece',
    commonUnits: ['piece', 'unit', 'set', 'box'],
    defaultName: 'NextGen Mobile & Electronics World',
    defaultType: 'Mobile Smartphone & Accessory Store',
    features: { inventory: true, expiry: false, batches: false, tables: false, appointments: false, repairs: true, orders: false }
  },
  footwear: {
    key: 'footwear',
    name: 'Footwear Store',
    tagline: 'Size-run inventory tracking (UK/Euro 5-11), brand catalog & seasonal sales',
    subcategories: ['Family Footwear Store', 'Sports & Athletic Shoe Boutique', 'Formal & Leather Shoes', 'Comfort & Orthopedic Footwear'],
    stockUnit: 'pair',
    commonUnits: ['pair', 'box', 'piece'],
    defaultName: 'StepRight Shoes & Footwear',
    defaultType: 'Family Footwear Store',
    features: { inventory: true, expiry: false, batches: false, tables: false, appointments: false, repairs: false, orders: false }
  },
  laundry: {
    key: 'laundry',
    name: 'Laundry & Dry Cleaning',
    tagline: 'Per-piece garment tagging, wash-iron-dry clean stages & delivery dispatch',
    subcategories: ['Dry Cleaners & Laundry Service', 'Laundromat & Self-Service', 'Steam Ironing & Express Press', 'Commercial Linen Service'],
    stockUnit: 'cloth',
    commonUnits: ['cloth', 'piece', 'kg', 'set', 'pair'],
    defaultName: 'Crystal Clear Laundry & Dry Cleaners',
    defaultType: 'Dry Cleaners & Laundry Service',
    features: { inventory: true, expiry: false, batches: false, tables: false, appointments: false, repairs: false, orders: true }
  }
};

function getSeedProductsForCategory(category, businessId, orgId) {
  const now = new Date().toISOString();
  const daysAhead = (d) => new Date(Date.now() + d * 86400000).toISOString().split('T')[0];

  const seeds = {
    grocery: [
      { name: 'Daawat Rozana Basmati Rice 5kg', sku: 'GRO-RICE-05K', cat: 'Grains & Staples', brand: 'Daawat', buy: 380, sell: 475, qty: 45, unit: 'packet', min: 15, exp: daysAhead(180), attrs: { batch: 'BCH-2024-R09' } },
      { name: 'Fortune Sunlite Sunflower Oil 1L', sku: 'GRO-OIL-01L', cat: 'Edible Oils', brand: 'Fortune', buy: 122, sell: 145, qty: 6, unit: 'packet', min: 12, exp: daysAhead(120), attrs: { batch: 'OIL-993-B' } },
      { name: 'Amul Taaza Toned Milk 500ml', sku: 'GRO-MILK-500', cat: 'Dairy & Bakery', brand: 'Amul', buy: 24, sell: 28, qty: 2, unit: 'packet', min: 20, exp: daysAhead(2), attrs: { batch: 'AML-0442' } },
      { name: 'Aashirvaad Shudh Chakki Atta 10kg', sku: 'GRO-ATTA-10K', cat: 'Grains & Staples', brand: 'Aashirvaad', buy: 410, sell: 490, qty: 28, unit: 'packet', min: 10, exp: daysAhead(90), attrs: { batch: 'ITC-ATT-88' } },
      { name: 'Tata Salt Vacuum Evaporated 1kg', sku: 'GRO-SALT-01K', cat: 'Spices & Seasonings', brand: 'Tata', buy: 22, sell: 28, qty: 64, unit: 'packet', min: 20, exp: daysAhead(360), attrs: { batch: 'TAT-SLT-01' } },
      { name: 'Maggi 2-Minute Noodles 280g (Pack of 4)', sku: 'GRO-MAG-4PK', cat: 'Snacks & Packaged Food', brand: 'Nestle', buy: 48, sell: 56, qty: 8, unit: 'packet', min: 15, exp: daysAhead(150), attrs: { batch: 'NST-M4' } }
    ],
    hardware: [
      { name: 'Havells 2.5 sq.mm FR Copper Wire (90m)', sku: 'ELEC-WIR-25', cat: 'Wiring & Cables', brand: 'Havells', buy: 2150, sell: 2650, qty: 14, unit: 'roll', min: 5, exp: null, attrs: { color: 'Red', length: '90m' } },
      { name: 'Astral 1 inch PVC Pipe Class 1 (6m)', sku: 'PLB-PIPE-1IN', cat: 'Plumbing Pipes', brand: 'Astral', buy: 280, sell: 360, qty: 40, unit: 'piece', min: 15, exp: null, attrs: { pressure: 'Class 1' } },
      { name: 'Anchor Roma 6A 1-Way Modular Switch', sku: 'ELEC-SWT-6A', cat: 'Switches & Sockets', brand: 'Anchor', buy: 32, sell: 48, qty: 85, unit: 'piece', min: 30, exp: null, attrs: { amp: '6A' } },
      { name: 'Bosch Professional Impact Drill GSB 550', sku: 'HRD-DRL-550', cat: 'Power Tools', brand: 'Bosch', buy: 2350, sell: 2950, qty: 4, unit: 'piece', min: 2, exp: null, attrs: { wattage: '550W' } },
      { name: 'Asian Paints Apex Ultima White 20L', sku: 'PNT-APX-20L', cat: 'Paints & Finishes', brand: 'Asian Paints', buy: 4600, sell: 5400, qty: 3, unit: 'bucket', min: 4, exp: null, attrs: { shade: 'Brilliant White' } }
    ],
    agriculture: [
      { name: 'Mahyco Hybrid Cotton Seeds 450g', sku: 'AGR-COT-450', cat: 'Hybrid Seeds', brand: 'Mahyco', buy: 720, sell: 860, qty: 35, unit: 'packet', min: 10, exp: daysAhead(240), attrs: { germinationRate: '85%' } },
      { name: 'IFFCO DAP 18:46:0 Fertilizer 50kg', sku: 'AGR-DAP-50K', cat: 'Fertilizers', brand: 'IFFCO', buy: 1250, sell: 1350, qty: 95, unit: 'bag', min: 20, exp: daysAhead(700), attrs: { npkRatio: '18-46-0' } },
      { name: 'Syngenta Karate Insecticide 500ml', sku: 'AGR-INS-500', cat: 'Pesticides', brand: 'Syngenta', buy: 440, sell: 530, qty: 12, unit: 'bottle', min: 10, exp: daysAhead(180), attrs: { formulation: '5% EC' } },
      { name: 'Aspee Knapsack Crop Sprayer 16L', sku: 'AGR-SPRY-16L', cat: 'Farming Equipment', brand: 'Aspee', buy: 1800, sell: 2300, qty: 5, unit: 'piece', min: 3, exp: null, attrs: { capacity: '16L' } }
    ],
    clothing: [
      { name: "Arrow Men's Premium Oxford Cotton Shirt - Sky Blue", sku: 'CLO-MSH-01', cat: "Men's Wear", brand: 'Arrow', buy: 1100, sell: 1899, qty: 18, unit: 'piece', min: 5, exp: null, attrs: { size: '40 / L', color: 'Sky Blue' } },
      { name: 'Biba Embroidered Anarkali Kurta Set', sku: 'CLO-WKU-02', cat: "Women's Ethnic", brand: 'Biba', buy: 1800, sell: 3299, qty: 8, unit: 'set', min: 3, exp: null, attrs: { size: 'M', color: 'Teal' } },
      { name: "Levi's 511 Slim Fit Denim Jeans 32W", sku: 'CLO-MJN-32', cat: "Men's Wear", brand: "Levi's", buy: 1950, sell: 3199, qty: 12, unit: 'piece', min: 4, exp: null, attrs: { waist: '32', fit: 'Slim Fit' } },
      { name: 'Organic Cotton Kids Sleepwear Set', sku: 'CLO-KID-01', cat: "Kids' Wear", brand: 'FirstCry', buy: 380, sell: 699, qty: 25, unit: 'set', min: 6, exp: null, attrs: { ageGroup: '3-4 Years' } }
    ],
    medical: [
      { name: 'Augmentin 625 Duo Tablets (Strip of 10)', sku: 'MED-AUG-625', cat: 'Antibiotics (Schedule H)', brand: 'GSK', buy: 172, sell: 204, qty: 34, unit: 'strip', min: 15, exp: daysAhead(300), attrs: { saltComposition: 'Amoxicillin + Clavulanic Acid', batch: 'AG24B10' } },
      { name: 'Dolo 650mg Paracetamol Tablets (Strip of 15)', sku: 'MED-DOLO-650', cat: 'Analgesics & Antipyretic', brand: 'Micro Labs', buy: 26, sell: 34, qty: 110, unit: 'strip', min: 30, exp: daysAhead(450), attrs: { saltComposition: 'Paracetamol 650mg', batch: 'ML-9912' } },
      { name: 'Azithral 500mg Tablets (Strip of 5)', sku: 'MED-AZI-500', cat: 'Antibiotics', brand: 'Alembic', buy: 98, sell: 121, qty: 8, unit: 'strip', min: 12, exp: daysAhead(180), attrs: { saltComposition: 'Azithromycin 500mg', batch: 'AZ-440' } },
      { name: 'Omerez D Capsule (Strip of 10)', sku: 'MED-OMR-D', cat: 'Gastrointestinal', brand: 'Alkem', buy: 85, sell: 110, qty: 4, unit: 'strip', min: 10, exp: daysAhead(35), attrs: { saltComposition: 'Omeprazole + Domperidone', batch: 'AL-512' } }
    ],
    food: [
      { name: 'Paneer Butter Masala', sku: 'FOOD-PBM-01', cat: 'Main Course - Veg', brand: 'Kitchen', buy: 95, sell: 260, qty: 50, unit: 'plate', min: 10, exp: null, attrs: { prepTime: '15 mins', calories: '420 kcal' } },
      { name: 'Butter Naan (Tandoori)', sku: 'FOOD-NAN-01', cat: 'Breads', brand: 'Kitchen', buy: 12, sell: 45, qty: 100, unit: 'piece', min: 20, exp: null, attrs: { prepTime: '5 mins' } },
      { name: 'Chicken Dum Biryani (Hyderabadi)', sku: 'FOOD-CHK-BIR', cat: 'Biryani Special', brand: 'Kitchen', buy: 130, sell: 340, qty: 35, unit: 'portion', min: 10, exp: null, attrs: { spicyLevel: 'Medium Hot' } },
      { name: 'Cold Brew Caramel Frappuccino', sku: 'FOOD-COF-01', cat: 'Beverages', brand: 'Barista', buy: 45, sell: 180, qty: 40, unit: 'glass', min: 10, exp: null, attrs: { ice: 'Crushed' } }
    ],
    stationery: [
      { name: 'Classmate Spiral Notebook 300 Pages (A4)', sku: 'STA-NBK-300', cat: 'Notebooks & Registers', brand: 'ITC Classmate', buy: 115, sell: 160, qty: 45, unit: 'piece', min: 15, exp: null, attrs: { ruling: 'Single Ruled' } },
      { name: 'JK Copier A4 Paper 75 GSM (Ream of 500)', sku: 'STA-JKC-75G', cat: 'Printing Paper', brand: 'JK Paper', buy: 275, sell: 340, qty: 18, unit: 'ream', min: 10, exp: null, attrs: { gsm: '75 GSM' } },
      { name: 'Reynolds 045 Fine Ball Pen (Blue Box of 20)', sku: 'STA-PEN-BL20', cat: 'Writing Instruments', brand: 'Reynolds', buy: 130, sell: 180, qty: 22, unit: 'box', min: 8, exp: null, attrs: { inkColor: 'Blue' } },
      { name: 'Camlin Exam Geometry Box Kit', sku: 'STA-GEO-CAM', cat: 'Geometry & Drawing', brand: 'Camlin', buy: 95, sell: 140, qty: 30, unit: 'set', min: 10, exp: null, attrs: { instruments: 'Full Set' } }
    ],
    salon: [
      { name: "L'Oreal Professional X-Tenso Straightening Kit", sku: 'SAL-LOR-XTN', cat: 'Hair Chemical Treatments', brand: "L'Oreal", buy: 1450, sell: 2800, qty: 8, unit: 'kit', min: 4, exp: daysAhead(360), attrs: { volume: '250ml' } },
      { name: 'Lotus Herbal Radiant Gold Facial Kit', sku: 'SAL-LOT-GLD', cat: 'Skin & Facial Supplies', brand: 'Lotus Herbals', buy: 890, sell: 1650, qty: 12, unit: 'kit', min: 5, exp: daysAhead(280), attrs: { treatments: '6 sessions' } },
      { name: 'Moroccanoil Treatment Original 100ml', sku: 'SAL-MOR-OIL', cat: 'Hair Styling & Serums', brand: 'Moroccanoil', buy: 2300, sell: 3300, qty: 6, unit: 'bottle', min: 3, exp: daysAhead(500), attrs: { origin: 'Israel' } }
    ],
    travel: [
      { name: 'Kerala Serenity Tour 5N/6D (Munnar + Alleppey Houseboat)', sku: 'TRV-KER-5N', cat: 'Domestic Tour Packages', brand: 'BizPilot Tours', buy: 18500, sell: 26000, qty: 20, unit: 'package', min: 5, exp: null, attrs: { nights: '5 Nights', pax: 'Per Person' } },
      { name: 'Dubai Extravaganza 4N/5D with Desert Safari & Burj Khalifa', sku: 'TRV-DXB-4N', cat: 'International Tour Packages', brand: 'BizPilot Tours', buy: 34000, sell: 46500, qty: 15, unit: 'package', min: 4, exp: null, attrs: { visaIncluded: true } },
      { name: 'Goa Weekend Sun & Sand 3N/4D Resort Stay', sku: 'TRV-GOA-3N', cat: 'Weekend Getaways', brand: 'BizPilot Tours', buy: 9500, sell: 14200, qty: 30, unit: 'package', min: 8, exp: null, attrs: { mealPlan: 'CP (Breakfast)' } }
    ],
    furniture: [
      { name: 'Solid Teak Wood 6-Seater Dining Table Set', sku: 'FUR-DIN-06', cat: 'Living & Dining Room', brand: 'In-House Woodcraft', buy: 26000, sell: 42000, qty: 3, unit: 'set', min: 2, exp: null, attrs: { wood: 'CP Teak', finish: 'Honey Gloss' } },
      { name: 'Ergonomic High-Back Executive Office Chair', sku: 'FUR-OFF-CH1', cat: 'Office & Workstation', brand: 'Featherlite', buy: 6800, sell: 10999, qty: 14, unit: 'piece', min: 4, exp: null, attrs: { mechanism: 'Synchro-Tilt' } },
      { name: 'King Size Hydraulic Storage Bed (Engineered Wood)', sku: 'FUR-BED-KG', cat: 'Bedroom Furniture', brand: 'In-House Woodcraft', buy: 18500, sell: 29500, qty: 5, unit: 'piece', min: 2, exp: null, attrs: { dimensions: '72x78 inches' } }
    ],
    electronics: [
      { name: 'Samsung Galaxy A35 5G (8GB / 128GB - Awesome Navy)', sku: 'ELE-SAM-A35', cat: 'Smartphones & 5G', brand: 'Samsung', buy: 24200, sell: 27999, qty: 9, unit: 'piece', min: 3, exp: null, attrs: { imeiSample: '354890123456781', warranty: '1 Year Manufacturer' } },
      { name: 'Apple 20W USB-C Power Adapter (Original)', sku: 'ELE-APP-20W', cat: 'Accessories & Chargers', brand: 'Apple', buy: 1450, sell: 1900, qty: 25, unit: 'piece', min: 8, exp: null, attrs: { wattage: '20W Fast' } },
      { name: 'Boat Rockerz 450 Bluetooth Headphones', sku: 'ELE-BOA-450', cat: 'Audio & Wearables', brand: 'boAt', buy: 950, sell: 1499, qty: 18, unit: 'piece', min: 6, exp: null, attrs: { playtime: '15 Hours' } },
      { name: 'SanDisk Ultra Dual 64GB USB Type-C Flash Drive', sku: 'ELE-SND-64G', cat: 'Storage & Memory', brand: 'SanDisk', buy: 550, sell: 799, qty: 30, unit: 'piece', min: 10, exp: null, attrs: { speed: '150MB/s' } }
    ],
    footwear: [
      { name: "Puma Men's Flyer Runner Mesh Shoes - Black (UK 9)", sku: 'FTW-PUM-RN9', cat: 'Sports & Running', brand: 'Puma', buy: 1650, sell: 2999, qty: 8, unit: 'pair', min: 3, exp: null, attrs: { size: 'UK 9 / Euro 43', color: 'Black' } },
      { name: "Red Tape Men's Classic Leather Formal Oxford (UK 8)", sku: 'FTW-RED-OX8', cat: 'Formal & Dress Shoes', brand: 'Red Tape', buy: 1350, sell: 2495, qty: 11, unit: 'pair', min: 4, exp: null, attrs: { material: 'Genuine Leather', size: 'UK 8' } },
      { name: "Bata Women's Comfit Cushion Wedge Sandal (UK 6)", sku: 'FTW-BAT-WS6', cat: "Women's Casual & Comfort", brand: 'Bata', buy: 650, sell: 1199, qty: 15, unit: 'pair', min: 5, exp: null, attrs: { size: 'UK 6', heel: '1.5 inch wedge' } }
    ],
    laundry: [
      { name: "Gent's Two-Piece Suit Dry Cleaning & Steam Press", sku: 'LAU-SUT-DC', cat: 'Dry Cleaning Service', brand: 'Service', buy: 80, sell: 280, qty: 50, unit: 'set', min: 10, exp: null, attrs: { turnaroundTime: '24 Hours' } },
      { name: 'Silk Saree Delicate Care & Rolling Press', sku: 'LAU-SAR-PR', cat: 'Ethnic Care & Press', brand: 'Service', buy: 50, sell: 160, qty: 80, unit: 'piece', min: 15, exp: null, attrs: { process: 'Steam Finish' } },
      { name: 'Winter Heavy Blanket / Quilt Double Bed Wash', sku: 'LAU-BLK-DB', cat: 'Heavy Linen & Comforter', brand: 'Service', buy: 110, sell: 350, qty: 30, unit: 'piece', min: 10, exp: null, attrs: { sanitization: 'Thermal UV' } }
    ]
  };

  const list = seeds[category] || seeds.grocery;
  return list.map((item, idx) => ({
    id: `prod-${businessId}-${idx + 1}-${Math.random().toString(36).substr(2, 5)}`,
    org_id: orgId,
    business_id: businessId,
    name: item.name,
    barcode: '890100' + (1000 + idx),
    sku: item.sku,
    category: item.cat,
    brand: item.brand,
    purchase_price: item.buy,
    selling_price: item.sell,
    quantity: item.qty,
    unit: item.unit,
    min_stock_level: item.min,
    expiry_date: item.exp,
    attributes_json: JSON.stringify(item.attrs || {}),
    created_at: now,
    updated_at: now
  }));
}

module.exports = {
  CATEGORIES_META,
  getSeedProductsForCategory,
};
