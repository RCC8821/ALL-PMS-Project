
const express = require('express');
const jwt = require('jsonwebtoken');
const { sheets, spreadsheetId } = require('../config/googleSheet');

const router = express.Router();

// Allowed user types - हमेशा UPPERCASE में रखो
const ALLOWED_USER_TYPES = [
  'ADMIN',
  'AHUJA',
  'ABBOTT',
  'RANA',
  'RNTU',
  'SCOPE',
  'NEWSCOPE',
  'GUPTA_JI_C',
  'GUPTA_JI_B',
  'GUPTA_JI_D',
  'Scope_Adjusting',
  'Manish_Jain',
  'UDIT_AGARWAL',
  'MANISH_JAIN'
];

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email और password जरूरी हैं' });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:C', // A: Email, B: Password, C: UserType
    });

    const rows = response.data.values || [];

    if (rows.length <= 1) {
      return res.status(400).json({ error: 'कोई user नहीं मिला' });
    }

    // Case-insensitive email + exact password
    const userRow = rows.slice(1).find(
      (row) =>
        row[0]?.trim().toLowerCase() === email.trim().toLowerCase() &&
        row[1]?.trim() === password.trim()
    );

    if (!userRow) {
      return res.status(401).json({ error: 'गलत email या password' });
    }

    // UserType को हमेशा UPPERCASE में normalize करो
    let userType = (userRow[2] || '').trim().toUpperCase().replace(/\s+/g, '');

    // अगर sheet में "Admin" लिखा है → "ADMIN" बन जाएगा
    // "Govind Ram Nagar" → "GOVINDRAMNAGAR" (spaces हट गए)
    
    // Allowed check - normalized version से
    if (!ALLOWED_USER_TYPES.includes(userType)) {
      // अगर spaces वाली value match नहीं कर रही तो original check भी कर सकते हो (fallback)
      const originalUserType = (userRow[2] || '').trim();
      console.log(originalUserType)

      if (!ALLOWED_USER_TYPES.some(allowed => 
        allowed.replace(/\s+/g, '') === originalUserType.toUpperCase().replace(/\s+/g, '')
      )) {
        return res.status(403).json({ error: 'इस user type की अनुमति नहीं है' });
      }
      // अगर fallback match हुआ तो original को normalized में बदल दो
      userType = originalUserType.toUpperCase().replace(/\s+/g, '');
    }

    // JWT Token
    const token = jwt.sign(
      { email: email.trim().toLowerCase(), userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      userType, // frontend को normalized भेज रहे हैं
      message: 'Login सफल!',
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error. बाद में कोशिश करें।' });
  }
});

// Middleware: JWT Verify (बदलाव नहीं चाहिए)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token नहीं मिला' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expire हो गया' });
      }
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

router.get('/user', authenticateToken, (req, res) => {
  res.json({
    email: req.user.email,
    userType: req.user.userType,
  });
});

module.exports = router;