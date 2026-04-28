/**
 * adminAuth.js — admin-only authentication middleware.
 *
 * Reads the admin password from the X-Admin-Password request header
 * and matches it against teams.admin.password in winners.json.
 *
 * On success, attaches { teamKey: 'admin', teamNameAr } to req.team.
 * On failure, responds 401 with an Arabic error message.
 *
 * SECURITY:
 *  - Never logs the password.
 *  - Never returns the password or any team object in the response.
 *  - Header-based (X-Admin-Password) so the password is not part of
 *    the JSON body and won't be logged by body-parsing middleware.
 */

const fs = require('fs');
const path = require('path');

// DATA_PATH env var → path to winners.json (default: ./backend/data/winners.json)
const DATA_PATH =
  process.env.DATA_PATH ||
  path.join(__dirname, '..', 'data', 'winners.json');

const readData = () => JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

const adminAuth = (req, res, next) => {
  // Header names are lowercased by Node's HTTP parser.
  const password = req.get('X-Admin-Password');

  if (typeof password !== 'string' || password.length === 0) {
    return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
  }

  let data;
  try {
    data = readData();
  } catch (err) {
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }

  const adminTeam = data && data.teams && data.teams.admin;

  if (!adminTeam || typeof adminTeam.password !== 'string') {
    // Admin team not configured — treat as auth failure, do not leak details.
    return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
  }

  if (adminTeam.password !== password) {
    return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
  }

  // Attach minimal admin identity to the request — never the password.
  req.team = {
    teamKey: 'admin',
    teamNameAr: adminTeam.name_ar,
  };

  next();
};

module.exports = adminAuth;
module.exports.DATA_PATH = DATA_PATH;
