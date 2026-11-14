const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb, queryOne, runSql } = require('../db/sqlite');
const { createToken, authMiddleware } = require('../middleware/auth');
const { validate, signUpSchema, signInSchema } = require('../middleware/validation');

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', validate(signUpSchema), async (req, res) => {
  try {
    const { fullName, email, mobile, password } = req.body;
    const db = await getDb();

    // Check existing
    const existing = queryOne(db, 'SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const userId = 'usr-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    const orgId = 'org-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const now = new Date().toISOString();

    // Insert user
    runSql(
      db,
      'INSERT INTO users (id, email, password_hash, full_name, mobile, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, email.toLowerCase().trim(), passwordHash, fullName, mobile, 'owner', now]
    );

    // Insert org with no active business yet
    runSql(
      db,
      'INSERT INTO organizations (id, name, owner_id, currency, country, active_business_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [orgId, `${fullName}'s Business Group`, userId, 'INR', 'India', null, now]
    );

    // Insert audit log
    runSql(
      db,
      'INSERT INTO audit_logs (id, org_id, business_id, action, entity_type, entity_id, actor_name, actor_role, details_json, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['aud-' + Date.now().toString(36), orgId, null, 'USER_REGISTERED', 'User', userId, fullName, 'owner', JSON.stringify({ email, mobile }), now]
    );

    const token = createToken({
      userId,
      email: email.toLowerCase().trim(),
      fullName,
      role: 'owner',
      orgId,
      activeBusinessId: null,
    });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: userId,
        email: email.toLowerCase().trim(),
        fullName,
        mobile,
        role: 'owner',
      },
      onboardingComplete: false,
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create user account' });
  }
});

// POST /api/auth/signin
router.post('/signin', validate(signInSchema), async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;
    const db = await getDb();

    const term = emailOrMobile.trim().toLowerCase();
    const user = queryOne(
      db,
      'SELECT * FROM users WHERE LOWER(email) = ? OR mobile = ?',
      [term, emailOrMobile.trim()]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email/mobile or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email/mobile or password' });
    }

    // Lookup organization and active business
    const org = queryOne(db, 'SELECT * FROM organizations WHERE owner_id = ?', [user.id]);
    let activeBusiness = null;
    let onboardingComplete = false;

    if (org && org.active_business_id) {
      activeBusiness = queryOne(db, 'SELECT * FROM business_profiles WHERE id = ?', [org.active_business_id]);
      if (activeBusiness && activeBusiness.onboarding_complete) {
        onboardingComplete = true;
      }
    }

    const token = createToken({
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      orgId: org ? org.id : null,
      activeBusinessId: activeBusiness ? activeBusiness.id : null,
    });

    res.json({
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        mobile: user.mobile,
        role: user.role,
      },
      business: activeBusiness ? {
        id: activeBusiness.id,
        name: activeBusiness.name,
        category: activeBusiness.category,
        businessType: activeBusiness.business_type,
        currency: activeBusiness.currency,
      } : null,
      onboardingComplete,
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Internal authentication error' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const user = queryOne(db, 'SELECT id, email, full_name, mobile, role, created_at FROM users WHERE id = ?', [req.user.userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const org = queryOne(db, 'SELECT * FROM organizations WHERE owner_id = ? OR id = ?', [user.id, req.user.orgId]);
    let activeBusiness = null;
    if (org && org.active_business_id) {
      activeBusiness = queryOne(db, 'SELECT * FROM business_profiles WHERE id = ?', [org.active_business_id]);
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        mobile: user.mobile,
        role: user.role,
      },
      org: org ? { id: org.id, name: org.name, currency: org.currency } : null,
      business: activeBusiness ? {
        id: activeBusiness.id,
        name: activeBusiness.name,
        category: activeBusiness.category,
        businessType: activeBusiness.business_type,
        currency: activeBusiness.currency,
        onboardingComplete: Boolean(activeBusiness.onboarding_complete),
      } : null,
      onboardingComplete: activeBusiness ? Boolean(activeBusiness.onboarding_complete) : false,
    });
  } catch (err) {
    console.error('Auth me error:', err);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

module.exports = router;
