const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb, queryOne, runSql } = require('../db/sqlite');
const { createToken, authMiddleware } = require('../middleware/auth');
const { validate, signUpSchema, signInSchema } = require('../middleware/validation');

const router = express.Router();

// Helper to generate a 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/signup - Requires email verification
router.post('/signup', validate(signUpSchema), async (req, res) => {
  try {
    const { fullName, email, mobile, password } = req.body;
    const db = await getDb();
    const cleanEmail = email.toLowerCase().trim();

    // Check existing user
    const existing = queryOne(db, 'SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const userId = 'usr-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    const orgId = 'org-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    const verificationCode = generateVerificationCode();

    // Insert user
    runSql(
      db,
      'INSERT INTO users (id, email, password_hash, full_name, mobile, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, cleanEmail, passwordHash, fullName, mobile, 'owner', now]
    );

    // Insert verification code record
    runSql(
      db,
      'INSERT OR REPLACE INTO user_verifications (email, code, is_verified, expires_at, created_at) VALUES (?, ?, 0, ?, ?)',
      [cleanEmail, verificationCode, expiresAt, now]
    );

    // Insert organization
    runSql(
      db,
      'INSERT INTO organizations (id, name, owner_id, currency, country, active_business_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [orgId, `${fullName}'s Business Group`, userId, 'INR', 'India', null, now]
    );

    // Insert audit log
    runSql(
      db,
      'INSERT INTO audit_logs (id, org_id, business_id, action, entity_type, entity_id, actor_name, actor_role, details_json, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['aud-' + Date.now().toString(36), orgId, null, 'USER_REGISTERED_PENDING_VERIFICATION', 'User', userId, fullName, 'owner', JSON.stringify({ email: cleanEmail }), now]
    );

    res.status(201).json({
      message: 'Account created. Please verify your email with the 6-digit code sent to you.',
      email: cleanEmail,
      requiresVerification: true,
      demoCode: verificationCode, // Returned for ease of testing/demo exploration
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create user account' });
  }
});

// POST /api/auth/verify - Validate 6-digit email code
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and 6-digit verification code are required' });
    }

    const db = await getDb();
    const cleanEmail = email.toLowerCase().trim();
    const record = queryOne(
      db,
      'SELECT * FROM user_verifications WHERE LOWER(email) = ?',
      [cleanEmail]
    );

    if (!record) {
      return res.status(404).json({ error: 'No verification record found for this email' });
    }

    if (record.code !== code.trim()) {
      return res.status(400).json({ error: 'Invalid 6-digit verification code. Please check and try again.' });
    }

    // Mark as verified
    runSql(
      db,
      'UPDATE user_verifications SET is_verified = 1 WHERE LOWER(email) = ?',
      [cleanEmail]
    );

    const user = queryOne(db, 'SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (!user) {
      return res.status(404).json({ error: 'User record not found' });
    }

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
      message: 'Email successfully verified!',
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
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// POST /api/auth/resend-code
router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const db = await getDb();
    const cleanEmail = email.toLowerCase().trim();
    const user = queryOne(db, 'SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newCode = generateVerificationCode();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    runSql(
      db,
      'INSERT OR REPLACE INTO user_verifications (email, code, is_verified, expires_at, created_at) VALUES (?, ?, 0, ?, ?)',
      [cleanEmail, newCode, expiresAt, now]
    );

    res.json({
      message: 'A new 6-digit verification code has been dispatched.',
      email: cleanEmail,
      demoCode: newCode,
    });
  } catch (err) {
    console.error('Resend code error:', err);
    res.status(500).json({ error: 'Failed to resend code' });
  }
});

// POST /api/auth/signin - Strict email + password verification
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

    // Check verification status (demo owner is auto-verified)
    const verification = queryOne(
      db,
      'SELECT is_verified, code FROM user_verifications WHERE LOWER(email) = ?',
      [user.email.toLowerCase()]
    );

    if (verification && verification.is_verified === 0 && user.email !== 'owner@bizpilot.ai') {
      return res.status(403).json({
        error: 'Your email is not verified. Please complete 6-digit code verification.',
        requiresVerification: true,
        email: user.email,
        demoCode: verification.code,
      });
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

// GET /api/auth/me - Strictly requires valid JWT Bearer token
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
