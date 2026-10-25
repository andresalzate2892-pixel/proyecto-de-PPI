const crypto = require('crypto');

// Genera ids cortos tipo "krrtG11FFZ8" (igual que los que creaba json-server)
function generateId() {
  return crypto.randomBytes(9).toString('base64url').slice(0, 11);
}

module.exports = generateId;
