const express = require('express');
const { getDb, queryAll, queryOne, runSql } = require('../db/sqlite');
const { authMiddleware, createToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/business - list all businesses in user's organization
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const orgId = req.user.orgId || 'org-demo-1';
    const businesses = queryAll(
      db,
      'SELECT id, org_id, name, owner_name, category, business_type, mobile, email, city, state, currency, onboarding_complete, created_at FROM business_profiles WHERE org_id = ? ORDER BY created_at DESC',
      [orgId]
    );

    const org = queryOne(db, 'SELECT active_business_id FROM organizations WHERE id = ?', [orgId]);
    const activeBusinessId = org ? org.active_business_id : req.user.activeBusinessId;

    res.json({
      businesses,
      activeBusinessId,
    });
  } catch (err) {
    console.error('List businesses error:', err);
    res.status(500).json({ error: 'Failed to retrieve businesses' });
  }
});

// GET /api/business/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const business = queryOne(db, 'SELECT * FROM business_profiles WHERE id = ?', [req.params.id]);
    if (!business) {
      return res.status(404).json({ error: 'Business profile not found' });
    }

    res.json({
      ...business,
      operations: business.operations_json ? JSON.parse(business.operations_json) : {},
      onboardingComplete: Boolean(business.onboarding_complete),
    });
  } catch (err) {
    console.error('Get business error:', err);
    res.status(500).json({ error: 'Failed to retrieve business profile' });
  }
});

// POST /api/business/switch
router.post('/switch', authMiddleware, async (req, res) => {
  try {
    const { businessId } = req.body;
    if (!businessId) {
      return res.status(400).json({ error: 'businessId is required' });
    }

    const db = await getDb();
    const business = queryOne(db, 'SELECT * FROM business_profiles WHERE id = ?', [businessId]);
    if (!business) {
      return res.status(404).json({ error: 'Target business profile not found' });
    }

    const orgId = req.user.orgId || business.org_id;
    runSql(db, 'UPDATE organizations SET active_business_id = ? WHERE id = ?', [businessId, orgId]);

    const newToken = createToken({
      userId: req.user.userId,
      email: req.user.email,
      fullName: req.user.fullName,
      role: req.user.role,
      orgId,
      activeBusinessId: businessId,
    });

    res.json({
      message: 'Workspace switched successfully',
      token: newToken,
      business: {
        id: business.id,
        name: business.name,
        category: business.category,
        businessType: business.business_type,
        currency: business.currency,
        onboardingComplete: Boolean(business.onboarding_complete),
      },
    });
  } catch (err) {
    console.error('Switch business error:', err);
    res.status(500).json({ error: 'Failed to switch workspace' });
  }
});

// PUT /api/business/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const { name, ownerName, mobile, email, address, city, state, pincode, gstin } = req.body;

    const existing = queryOne(db, 'SELECT * FROM business_profiles WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Business not found' });
    }

    runSql(
      db,
      `UPDATE business_profiles SET
        name = COALESCE(?, name),
        owner_name = COALESCE(?, owner_name),
        mobile = COALESCE(?, mobile),
        email = COALESCE(?, email),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        pincode = COALESCE(?, pincode),
        gstin = COALESCE(?, gstin)
       WHERE id = ?`,
      [name, ownerName, mobile, email, address, city, state, pincode, gstin, req.params.id]
    );

    const updated = queryOne(db, 'SELECT * FROM business_profiles WHERE id = ?', [req.params.id]);
    res.json({
      message: 'Business updated successfully',
      business: updated,
    });
  } catch (err) {
    console.error('Update business error:', err);
    res.status(500).json({ error: 'Failed to update business profile' });
  }
});

module.exports = router;
