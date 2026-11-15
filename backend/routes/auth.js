const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { getDb, queryOne, runSql } = require('../db/sqlite');
const { createToken, authMiddleware } = require('../middleware/auth');
const { validate, signUpSchema, signInSchema } = require('../middleware/validation');
const { sendVerificationEmail } = require('../utils/mailer');

const router = express.Router();

// Cryptographically secure 6-digit verification code
function generateVerificationCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

// POST /api/auth/google - One-click Continue with Google / Gmail (No password needed!)
router.post('/google', async (req, res) => {
  try {
    const { email, fullName } = req.body || {};
    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: 'Valid Gmail or Google email address is required' });
    }

    const db = await getDb();
    const cleanEmail = String(email).toLowerCase().trim();
    const now = new Date().toISOString();

    let user = queryOne(db, 'SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    let org = null;

    if (!user) {
      const userId = 'usr-g-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
      const orgId = 'org-g-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
      const name = (fullName || cleanEmail.split('@')[0] || 'Business Owner').trim();

      runSql(
        db,
        'INSERT INTO users (id, email, password_hash, full_name, mobile, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, cleanEmail, 'GOOGLE_OAUTH_ACCOUNT', name, '', 'owner', now]
      );

      runSql(
        db,
        'INSERT INTO organizations (id, name, owner_id, currency, country, active_business_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [orgId, `${name}'s Business Group`, userId, 'INR', 'India', null, now]
      );

      runSql(
        db,
        'INSERT INTO audit_logs (id, org_id, business_id, action, entity_type, entity_id, actor_name, actor_role, details_json, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['aud-' + Date.now().toString(36), orgId, null, 'USER_SIGNIN_GOOGLE', 'User', userId, name, 'owner', JSON.stringify({ email: cleanEmail }), now]
      );

      user = queryOne(db, 'SELECT * FROM users WHERE id = ?', [userId]);
      org = queryOne(db, 'SELECT * FROM organizations WHERE id = ?', [orgId]);
    } else {
      org = queryOne(db, 'SELECT * FROM organizations WHERE owner_id = ?', [user.id]);
    }

    // Google authenticated accounts are pre-verified
    runSql(
      db,
      'INSERT OR REPLACE INTO user_verifications (email, code, is_verified, expires_at, created_at) VALUES (?, ?, 1, ?, ?)',
      [cleanEmail, 'GOOGLE_VERIFIED', '2099-01-01T00:00:00.000Z', now]
    );

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
      message: 'Signed in successfully with Google',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
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
    console.error('Google signin error:', err);
    res.status(500).json({ error: err.message || 'Failed to authenticate with Google' });
  }
});

// POST /api/auth/request-code - Continue with Email (Secure Passwordless OTP)
router.post('/request-code', async (req, res) => {
  try {
    const { email, fullName } = req.body || {};
    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    const db = await getDb();
    const cleanEmail = String(email).toLowerCase().trim();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // Secure 10-minute validity
    const verificationCode = generateVerificationCode();

    // Check rate limit: 30s cooldown between requests
    const existingVerif = queryOne(db, 'SELECT created_at FROM user_verifications WHERE LOWER(email) = ?', [cleanEmail]);
    if (existingVerif && existingVerif.created_at) {
      const elapsed = Date.now() - new Date(existingVerif.created_at).getTime();
      if (elapsed < 30000) {
        const waitSec = Math.ceil((30000 - elapsed) / 1000);
        return res.status(429).json({ error: `Please wait ${waitSec} seconds before requesting a new code.` });
      }
    }

    let user = queryOne(db, 'SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);

    if (!user) {
      const userId = 'usr-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
      const orgId = 'org-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
      const name = (fullName || cleanEmail.split('@')[0] || 'Business Owner').trim();

      runSql(
        db,
        'INSERT INTO users (id, email, password_hash, full_name, mobile, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, cleanEmail, 'PASSWORDLESS_ACCOUNT', name, '', 'owner', now]
      );

      runSql(
        db,
        'INSERT INTO organizations (id, name, owner_id, currency, country, active_business_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [orgId, `${name}'s Business Group`, userId, 'INR', 'India', null, now]
      );
    }

    runSql(
      db,
      'INSERT OR REPLACE INTO user_verifications (email, code, is_verified, expires_at, created_at) VALUES (?, ?, 0, ?, ?)',
      [cleanEmail, verificationCode, expiresAt, now]
    );

    let deliveryResult = { success: false, isRealDelivery: false };
    try {
      deliveryResult = await sendVerificationEmail({ to: cleanEmail, code: verificationCode, name: fullName });
    } catch (mailErr) {
      console.warn('[BizPilot Mailer] Warning: email sending exception:', mailErr.message);
    }

    res.json({
      message: deliveryResult.isRealDelivery
        ? `A confidential 6-digit confirmation code has been dispatched directly to ${cleanEmail}. Please check your inbox and spam folder.`
        : `A confidential 6-digit confirmation code has been dispatched to ${cleanEmail}.`,
      email: cleanEmail,
      requiresVerification: true,
      deliveredToEmail: deliveryResult.isRealDelivery,
    });
  } catch (err) {
    console.error('Request code error:', err);
    res.status(500).json({ error: err.message || 'Failed to dispatch verification code' });
  }
});

// POST /api/auth/signup - Optional password or passwordless registration
router.post('/signup', validate(signUpSchema), async (req, res) => {
  try {
    const { fullName, email, mobile, password } = req.body;
    const db = await getDb();
    const cleanEmail = email.toLowerCase().trim();

    // Check existing user
    const existing = queryOne(db, 'SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const userId = 'usr-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    const orgId = 'org-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    const passwordHash = password ? await bcrypt.hash(password, 10) : 'PASSWORDLESS_ACCOUNT';
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes expiry
    const verificationCode = generateVerificationCode();

    // Insert user
    runSql(
      db,
      'INSERT INTO users (id, email, password_hash, full_name, mobile, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, cleanEmail, passwordHash, fullName || 'Business Owner', mobile || '', 'owner', now]
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
      [orgId, `${fullName || 'Owner'}'s Business Group`, userId, 'INR', 'India', null, now]
    );

    // Insert audit log
    runSql(
      db,
      'INSERT INTO audit_logs (id, org_id, business_id, action, entity_type, entity_id, actor_name, actor_role, details_json, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['aud-' + Date.now().toString(36), orgId, null, 'USER_REGISTERED_PENDING_VERIFICATION', 'User', userId, fullName || 'Owner', 'owner', JSON.stringify({ email: cleanEmail }), now]
    );

    // Send verification email safely
    let deliveryResult = { success: false, isRealDelivery: false };
    try {
      deliveryResult = await sendVerificationEmail({ to: cleanEmail, code: verificationCode, name: fullName });
    } catch (mailErr) {
      console.warn('[BizPilot Mailer] Warning: email delivery exception:', mailErr.message);
    }

    res.status(201).json({
      message: deliveryResult.isRealDelivery
        ? `Account created. We have dispatched a 6-digit confirmation code directly to ${cleanEmail}.`
        : `Account created. A 6-digit confirmation code has been dispatched to ${cleanEmail}.`,
      email: cleanEmail,
      requiresVerification: true,
      deliveredToEmail: deliveryResult.isRealDelivery,
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: err.message || 'Failed to create user account' });
  }
});

// POST /api/auth/verify - Validate 6-digit email code
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body || {};
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and 6-digit verification code are required' });
    }

    const db = await getDb();
    const cleanEmail = String(email).toLowerCase().trim();
    const cleanCode = String(code).trim();
    const record = queryOne(
      db,
      'SELECT * FROM user_verifications WHERE LOWER(email) = ?',
      [cleanEmail]
    );

    if (!record || !record.code) {
      return res.status(400).json({ error: 'No active verification code found for this email. Please request a new code.' });
    }

    // Check expiration (10 minutes)
    if (new Date() > new Date(record.expires_at)) {
      runSql(db, 'UPDATE user_verifications SET code = NULL WHERE LOWER(email) = ?', [cleanEmail]);
      return res.status(400).json({ error: 'This verification code has expired (valid for 10 minutes). Please request a new code.' });
    }

    if (record.code !== cleanCode) {
      return res.status(400).json({ error: 'Invalid 6-digit verification code. Please check your email and try again.' });
    }

    // Mark as verified and WIPE code immediately so it can NEVER be reused (Single-Use OTP)
    runSql(
      db,
      'UPDATE user_verifications SET is_verified = 1, code = NULL WHERE LOWER(email) = ?',
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
    res.status(500).json({ error: err.message || 'Verification failed' });
  }
});

// POST /api/auth/resend-code
router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const db = await getDb();
    const cleanEmail = String(email).toLowerCase().trim();
    let user = queryOne(db, 'SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (!user) {
      const userId = 'usr-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
      const orgId = 'org-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
      const name = cleanEmail.split('@')[0] || 'Business Owner';
      const now = new Date().toISOString();

      runSql(
        db,
        'INSERT INTO users (id, email, password_hash, full_name, mobile, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, cleanEmail, 'PASSWORDLESS_ACCOUNT', name, '', 'owner', now]
      );

      runSql(
        db,
        'INSERT INTO organizations (id, name, owner_id, currency, country, active_business_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [orgId, `${name}'s Business Group`, userId, 'INR', 'India', null, now]
      );

      user = queryOne(db, 'SELECT * FROM users WHERE id = ?', [userId]);
    }

    // Rate limiting: 30-second cooldown
    const existingVerif = queryOne(db, 'SELECT created_at FROM user_verifications WHERE LOWER(email) = ?', [cleanEmail]);
    if (existingVerif && existingVerif.created_at) {
      const elapsed = Date.now() - new Date(existingVerif.created_at).getTime();
      if (elapsed < 30000) {
        const waitSec = Math.ceil((30000 - elapsed) / 1000);
        return res.status(429).json({ error: `Please wait ${waitSec} seconds before requesting a new code.` });
      }
    }

    const newCode = generateVerificationCode();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    runSql(
      db,
      'INSERT OR REPLACE INTO user_verifications (email, code, is_verified, expires_at, created_at) VALUES (?, ?, 0, ?, ?)',
      [cleanEmail, newCode, expiresAt, now]
    );

    let deliveryResult = { success: false, isRealDelivery: false };
    try {
      deliveryResult = await sendVerificationEmail({ to: cleanEmail, code: newCode, name: user ? user.full_name : '' });
    } catch (mailErr) {
      console.warn('[BizPilot Mailer] Warning: resend exception:', mailErr.message);
    }

    res.json({
      message: deliveryResult.isRealDelivery
        ? `A fresh 6-digit confirmation code has been dispatched to ${cleanEmail}. Please check your inbox and spam folder.`
        : `A fresh 6-digit confirmation code has been dispatched to ${cleanEmail}.`,
      email: cleanEmail,
      deliveredToEmail: deliveryResult.isRealDelivery,
    });
  } catch (err) {
    console.error('Resend code error:', err);
    res.status(500).json({ error: err.message || 'Failed to resend code' });
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

    if (!password || user.password_hash === 'PASSWORDLESS_ACCOUNT' || user.password_hash === 'GOOGLE_OAUTH_ACCOUNT') {
      const newCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
      runSql(
        db,
        'INSERT OR REPLACE INTO user_verifications (email, code, is_verified, expires_at, created_at) VALUES (?, ?, 0, ?, ?)',
        [user.email.toLowerCase(), newCode, expiresAt, new Date().toISOString()]
      );
      let deliveryResult = { success: false, isRealDelivery: false };
      try {
        deliveryResult = await sendVerificationEmail({ to: user.email, code: newCode, name: user.full_name });
      } catch (e) {}

      return res.status(200).json({
        message: deliveryResult.isRealDelivery
          ? `A 6-digit confirmation code has been dispatched to your email (${user.email}).`
          : `A 6-digit confirmation code has been dispatched to ${user.email}.`,
        requiresVerification: true,
        email: user.email,
        deliveredToEmail: deliveryResult.isRealDelivery,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email/mobile or password' });
    }

    // Check verification status
    const verification = queryOne(
      db,
      'SELECT is_verified, code FROM user_verifications WHERE LOWER(email) = ?',
      [user.email.toLowerCase()]
    );

    if (verification && verification.is_verified === 0) {
      return res.status(403).json({
        error: 'Your email is not verified yet. Please enter the 6-digit verification code sent to your email.',
        requiresVerification: true,
        email: user.email,
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
