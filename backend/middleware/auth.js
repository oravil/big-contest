/**
 * auth.js — password-only team authentication middleware.
 *
 * Reads the teams object from winners.json and matches req.body.password
 * against each team's password. On success, attaches { teamKey, teamNameAr }
 * to req.team. On failure, responds 401 with an Arabic error message.
 *
 * SECURITY:
 *  - Never logs passwords.
 *  - Never returns the teams object or any password in the response.
 */

const fs = require('fs');
const path = require('path');

// DATA_PATH env var → path to winners.json (default: ./backend/data/winners.json)
const DATA_PATH =
  process.env.DATA_PATH ||
  path.join(__dirname, '..', 'data', 'winners.json');

const readData = () => JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

const authMiddleware = (req, res, next) => {
  const password = req.body && req.body.password;

  if (typeof password !== 'string' || password.length === 0) {
    return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
  }

  let data;
  try {
    data = readData();
  } catch (err) {
    // Do not leak filesystem details.
    return res.status(500).json({ error: 'خطأ في الخادم' });
  }

  const teams = (data && data.teams) || {};
  let matchedKey = null;

  for (const teamKey of Object.keys(teams)) {
    if (teams[teamKey] && teams[teamKey].password === password) {
      matchedKey = teamKey;
      break;
    }
  }

  if (!matchedKey) {
    return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
  }

  // Attach minimal team identity to the request — never the password.
  req.team = {
    teamKey: matchedKey,
    teamNameAr: teams[matchedKey].name_ar,
  };

  next();
};

module.exports = authMiddleware;
module.exports.DATA_PATH = DATA_PATH;
