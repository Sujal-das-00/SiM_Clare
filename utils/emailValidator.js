import validator from "validator";
import { resolveMx } from "node:dns/promises";

export const validateEmail = async (email) => {
    if (!validator.isEmail(email)) {
        return { valid: false, reason: "Invalid email format" };
    }

    const domain = email.split("@")[1];

    try {
        const mxRecords = await resolveMx(domain);

        if (!mxRecords || mxRecords.length === 0) {
            return { valid: false, reason: "Domain cannot receive emails" };
        }

        return { valid: true };

    } catch (error) {
        console.error("DNS error:", error); // Debug
        return { valid: false, reason: "Invalid or non-existent domain" };
    }
};