const crypto = require('crypto');

// 🛡️ Ensure we have a fallback for local testing, but favor .env
const INTEGRITY_SECRET = process.env.HASH_SECRET || "Meycauayan_BJMP_Judicial_Ledger_2026";

/**
 * 🔒 UNIVERSAL GENERATOR
 * Generates a unique HMAC SHA-256 hash based on the record type.
 */
const generateHash = (type, data) => {
    let dataString = "";

    // 🎯 IMPORTANT: We stringify/normalize data so the hash is consistent
    switch (type) {
        case 'ATTENDANCE':
            // data: { pdl_id, timestamp, hours }
            dataString = `ATT|${data.pdl_id}|${data.timestamp}|${Number(data.hours).toFixed(2)}`;
            break;
        case 'TASTM':
            // data: { pdl_id, month, hours, days }
            dataString = `TAS|${data.pdl_id}|${data.month}|${Number(data.hours).toFixed(2)}|${data.days}`;
            break;
        case 'GCTA':
            // data: { pdl_id, month, days }
            dataString = `GCTA|${data.pdl_id}|${data.month}|${data.days}`;
            break;
        default:
            throw new Error(`Invalid Hash Type: ${type}`);
    }

    return crypto
        .createHmac('sha256', INTEGRITY_SECRET)
        .update(dataString)
        .digest('hex');
};

/**
 * ✅ UNIVERSAL VERIFIER
 * Compares a stored hash against a freshly generated one.
 */
const verifyIntegrity = (type, storedHash, data) => {
    if (!storedHash) return false; // If there's no hash, it's untrusted
    const currentHash = generateHash(type, data);
    return storedHash === currentHash;
};

// 🚀 Export the correctly named functions
module.exports = { generateHash, verifyIntegrity };