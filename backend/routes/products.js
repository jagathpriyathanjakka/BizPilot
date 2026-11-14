const express = require('express');
const { getDb, queryAll, queryOne, runSql } = require('../db/sqlite');
const { authMiddleware } = require('../middleware/auth');
const { validate, productSchema } = require('../middleware/validation');

const router = express.Router();

// GET /api/products
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const businessId = req.query.businessId || req.user.activeBusinessId || 'biz-grocery-demo';
    const { search, category, lowStock } = req.query;

    let sql = 'SELECT * FROM products WHERE business_id = ?';
    const params = [businessId];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(sku) LIKE ? OR barcode LIKE ?)';
      const term = `%${search.toLowerCase().trim()}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY name ASC';

    let products = queryAll(db, sql, params).map((p) => ({
      id: p.id,
      orgId: p.org_id,
      businessId: p.business_id,
      name: p.name,
      barcode: p.barcode,
      sku: p.sku,
      category: p.category,
      brand: p.brand,
      purchasePrice: p.purchase_price,
      sellingPrice: p.selling_price,
      quantity: p.quantity,
      unit: p.unit,
      minStockLevel: p.min_stock_level,
      expiryDate: p.expiry_date,
      attributes: p.attributes_json ? JSON.parse(p.attributes_json) : {},
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    if (lowStock === 'true') {
      products = products.filter((p) => p.quantity <= (p.minStockLevel || 5));
    }

    res.json({ products, total: products.length });
  } catch (err) {
    console.error('List products error:', err);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// POST /api/products
router.post('/', authMiddleware, validate(productSchema), async (req, res) => {
  try {
    const db = await getDb();
    const {
      businessId,
      name,
      sellingPrice,
      purchasePrice = 0,
      quantity = 0,
      unit = 'piece',
      sku,
      barcode,
      category = 'General',
      brand,
      minStockLevel = 5,
      expiryDate,
      attributes = {},
    } = req.body;

    const productId = 'prod-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    const orgId = req.user.orgId || 'org-demo-1';
    const now = new Date().toISOString();
    const generatedSku = sku || 'SKU-' + Date.now().toString(36).toUpperCase();

    runSql(
      db,
      `INSERT INTO products (
        id, org_id, business_id, name, barcode, sku, category, brand,
        purchase_price, selling_price, quantity, unit, min_stock_level,
        expiry_date, attributes_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        orgId,
        businessId,
        name,
        barcode || null,
        generatedSku,
        category,
        brand || null,
        purchasePrice,
        sellingPrice,
        quantity,
        unit,
        minStockLevel,
        expiryDate || null,
        JSON.stringify(attributes),
        now,
        now,
      ]
    );

    // Audit log
    runSql(
      db,
      `INSERT INTO audit_logs (id, org_id, business_id, action, entity_type, entity_id, actor_name, actor_role, details_json, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'aud-' + Date.now().toString(36),
        orgId,
        businessId,
        'PRODUCT_CREATED',
        'Product',
        productId,
        req.user.fullName || 'User',
        req.user.role || 'owner',
        JSON.stringify({ name, sellingPrice, quantity }),
        now,
      ]
    );

    res.status(201).json({
      message: 'Product created successfully',
      product: {
        id: productId,
        businessId,
        name,
        sku: generatedSku,
        sellingPrice,
        purchasePrice,
        quantity,
        unit,
        category,
      },
    });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const existing = queryOne(db, 'SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const {
      name,
      sellingPrice,
      purchasePrice,
      quantity,
      unit,
      sku,
      barcode,
      category,
      brand,
      minStockLevel,
      expiryDate,
      attributes,
    } = req.body;

    const now = new Date().toISOString();

    runSql(
      db,
      `UPDATE products SET
        name = COALESCE(?, name),
        selling_price = COALESCE(?, selling_price),
        purchase_price = COALESCE(?, purchase_price),
        quantity = COALESCE(?, quantity),
        unit = COALESCE(?, unit),
        sku = COALESCE(?, sku),
        barcode = COALESCE(?, barcode),
        category = COALESCE(?, category),
        brand = COALESCE(?, brand),
        min_stock_level = COALESCE(?, min_stock_level),
        expiry_date = COALESCE(?, expiry_date),
        attributes_json = COALESCE(?, attributes_json),
        updated_at = ?
       WHERE id = ?`,
      [
        name,
        sellingPrice,
        purchasePrice,
        quantity,
        unit,
        sku,
        barcode,
        category,
        brand,
        minStockLevel,
        expiryDate,
        attributes ? JSON.stringify(attributes) : null,
        now,
        req.params.id,
      ]
    );

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const existing = queryOne(db, 'SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    runSql(db, 'DELETE FROM products WHERE id = ?', [req.params.id]);

    runSql(
      db,
      `INSERT INTO audit_logs (id, org_id, business_id, action, entity_type, entity_id, actor_name, actor_role, details_json, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'aud-' + Date.now().toString(36),
        existing.org_id,
        existing.business_id,
        'PRODUCT_DELETED',
        'Product',
        req.params.id,
        req.user.fullName || 'User',
        req.user.role || 'owner',
        JSON.stringify({ name: existing.name }),
        new Date().toISOString(),
      ]
    );

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
