const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

function encrypt(text) {
  if (!text) return text;
  if (!ENCRYPTION_KEY) {
    console.warn("WARNING: ENCRYPTION_KEY not set. Returning plaintext.");
    return text;
  }
  // Prevent double encryption
  if (text.startsWith('enc:')) return text;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `enc:${iv.toString('hex')}:${encrypted}`;
}

function decrypt(text) {
  if (!text) return text;
  if (!text.startsWith('enc:')) {
    // Plaintext token (backward compatibility)
    return text;
  }
  
  if (!ENCRYPTION_KEY) {
    console.error("ERROR: ENCRYPTION_KEY not set. Cannot decrypt token.");
    return text;
  }

  const parts = text.split(':');
  if (parts.length !== 3) return text; // Invalid format

  const iv = Buffer.from(parts[1], 'hex');
  const encryptedText = Buffer.from(parts[2], 'hex');
  
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error("Token decryption failed", err);
    return null;
  }
}

// Helper to deeply encrypt/decrypt tokens object
function encryptTokensObject(tokens) {
  if (!tokens) return tokens;
  return {
    ...tokens,
    access_token: encrypt(tokens.access_token),
    refresh_token: encrypt(tokens.refresh_token),
  };
}

function decryptTokensObject(tokens) {
  if (!tokens) return tokens;
  return {
    ...tokens,
    access_token: decrypt(tokens.access_token),
    refresh_token: decrypt(tokens.refresh_token),
  };
}

module.exports = { encrypt, decrypt, encryptTokensObject, decryptTokensObject };
