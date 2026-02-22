import validator from "validator";
import dns from "dns/promises";

/**
 * Validates email format and MX record
 * @param {string} email
 * @returns {Promise<{valid: boolean, reason?: string}>}
 */
export const validateEmail = async (email) => {
    if (!validator.isEmail(email)) {
        return { valid: false, reason: "Invalid email format" };
    }
    const domain = email.split("@")[1];
    try {
        const mxRecords = await dns.resolveMx(domain);
        if (!mxRecords || mxRecords.length === 0) {
            return { valid: false, reason: "Domain cannot receive emails" };
        }
        return { valid: true };
    } catch (error) {
        return { valid: false, reason: "Invalid or non-existent domain" };
    }
};