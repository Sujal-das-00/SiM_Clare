import {
    findExactMatch,
    findPrefixMatch,
    getCountryOverride,
    logDetection
} from "../models/models.deviceCompatiblity.js";

import { parseUserAgent } from "../services/service.uaParser.js";


// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const MAX_KNOWN_IOS    = 26;   // iOS 26 released WWDC 2025 — update each year
const FALLBACK_IOS     = 17;   // safe fallback for unreadable versions
const ESIM_MIN_IOS     = 12.1; // iPhone XS and later


// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * Normalize raw OS name → standard label
 */
const normalizeOS = (os) => {
    if (!os) return null;
    if (os === "iPhone OS") return "iOS";
    if (os === "Mac OS X")  return "macOS";
    return os;
};


/**
 * Extract REAL iOS version strictly from "iPhone OS X_X" pattern.
 * This deliberately ignores Safari's "Version/26.0" and CriOS version
 * since those are browser versions, NOT OS versions.
 *
 * Examples:
 *   "iPhone OS 18_6"     → 18.6
 *   "iPhone OS 26_0_0"   → 26.0
 *   "Version/26.0"       → ignored (not matched)
 */
const extractIOSVersion = (ua) => {
    const match = ua.match(/iPhone OS (\d+)[_.](\d+)?/);
    if (!match) return null;

    const major = parseInt(match[1], 10);
    const minor = parseInt(match[2] || "0", 10);

    return parseFloat(`${major}.${minor}`);
};


/**
 * Sanitize iOS version.
 * - Below 12     → too old to be in circulation, fallback
 * - Above MAX+2  → unknown future version, cap at MAX
 * - iOS 26       → valid ✅ (Apple skipped 19-25)
 */
const sanitizeIOSVersion = (version) => {
    if (!version || isNaN(version)) return FALLBACK_IOS;

    const major = Math.floor(version);

    if (major < 12)                return FALLBACK_IOS;
    if (major > MAX_KNOWN_IOS + 2) return MAX_KNOWN_IOS;

    return version;
};


/**
 * Detect browser type from UA (useful for logging + debugging)
 */
const detectBrowser = (ua) => {
    if (/CriOS\//i.test(ua))  return "Chrome iOS";
    if (/FxiOS\//i.test(ua))  return "Firefox iOS";
    if (/EdgiOS\//i.test(ua)) return "Edge iOS";
    if (/OPiOS\//i.test(ua))  return "Opera iOS";
    if (/Safari\//i.test(ua)) return "Safari";
    return "Unknown";
};


// ─────────────────────────────────────────────
// MAIN FLOW
// ─────────────────────────────────────────────

export const deviceCompatibilityFlow = async ({ userAgent, country }) => {

    try {

        // ── 1. Guard: UA must exist ──────────────────────────────
        if (!userAgent) {
            return buildErrorResponse("User agent missing");
        }

        // ── 2. Parse UA ──────────────────────────────────────────
        const parsed = parseUserAgent(userAgent);

        if (!parsed) {
            return buildErrorResponse("Unable to parse user agent");
        }

        const model = parsed.model?.trim() || null;
        const os    = normalizeOS(parsed.os);
        let osVersion = null;

        console.log(`[UA Parse] model=${model} | os=${os} | raw osVersion=${parsed.osVersion}`);

        // ── 3. OS Version Extraction ─────────────────────────────
        if (os === "iOS") {
            /*
             * Always extract iOS version from raw UA string.
             * Never trust parsed.osVersion for iOS — parsers often
             * misread Safari's "Version/X" or CriOS version as the OS version.
             */
            const rawVersion = extractIOSVersion(userAgent);
            osVersion = sanitizeIOSVersion(rawVersion);

            const browser = detectBrowser(userAgent);
            console.log(`[iOS] browser=${browser} | rawVersion=${rawVersion} | sanitized=${osVersion}`);

        } else {
            osVersion = parseFloat(parsed.osVersion);
        }

        // ── 4. Completeness Check ────────────────────────────────
        if (!model || !os || !osVersion) {
            return buildErrorResponse("Incomplete device information");
        }

        // ── 5. DB Lookup — Exact Match First ─────────────────────
        /*
         * Works for Android devices with exact model codes (e.g. SM-G991B).
         * iOS devices have model_code = "iPhone" with match_type = "prefix"
         * so they will NOT match here — falls through to prefix match below.
         */
        let device          = await findExactMatch(model, os, osVersion);
        let detectionMethod = null;
        let confidence      = null;

        if (device) {
            detectionMethod = "exact_variant";
            confidence      = "high";
            console.log(`[DB] Exact match found: ${device.family_name}`);
        }

        // ── 6. DB Lookup — Prefix Match ──────────────────────────
        /*
         * Handles:
         *   - Android prefix codes (SM-G991 matches SM-G991B)
         *   - iPhones: model_code="iPhone", "iPhone" LIKE "iPhone%" → TRUE
         *     Ordered by min_os_version DESC so iOS 18.6 → iPhone 15 family ✅
         *                                          iOS 26.0 → iPhone 15 family ✅
         */
        if (!device) {
            device = await findPrefixMatch(model, os, osVersion);

            if (device) {
                detectionMethod = "prefix_match";
                confidence      = "high";
                console.log(`[DB] Prefix match found: ${device.family_name}`);
            }
        }

        // ── 7. Not Found ─────────────────────────────────────────
        if (!device) {
            console.log(`[DB] No match found for model=${model} os=${os} v=${osVersion}`);
            return buildErrorResponse("Device not found in database");
        }

        // ── 8. Country Override Check ────────────────────────────
        const override   = await getCountryOverride(device.variant_id, country);
        let esimEnabled  = device.esim_supported;

        if (override && override.esim_enabled === 0) {
            esimEnabled = 0;
            console.log(`[Override] eSIM disabled for variant=${device.variant_id} country=${country}`);
        }

        // ── 9. Build Final Response ──────────────────────────────
        const isCompatible = Boolean(esimEnabled);
        const browser      = os === "iOS" ? detectBrowser(userAgent) : null;

        const finalResponse = {
            compatible:        isCompatible,
            confidence,
            detection_method:  detectionMethod,
            device: {
                brand:   device.brand,
                family:  device.family_name,
                variant: model,
                ...(browser && { browser })   // only included for iOS
            },
            os: {
                name:    os,
                version: osVersion
            },
            reason: isCompatible
                ? "Device supports eSIM"
                : override?.esim_enabled === 0
                    ? "eSIM disabled for this region"
                    : "Device does not support eSIM",
            requires_manual_selection: false
        };

        // ── 10. Log & Return ─────────────────────────────────────
        await logDetection({
            userAgent,
            detectedModel:   model,
            detectedOs:      os,
            compatible:      isCompatible,
            confidence,
            detectionMethod
        });

        console.log("[Final Response]", finalResponse);
        return finalResponse;

    } catch (error) {
        console.error("[deviceCompatibilityFlow] Error:", error);
        return {
            compatible:               null,
            confidence:               "low",
            detection_method:         "error",
            requires_manual_selection: true,
            reason:                   "Internal compatibility detection error"
        };
    }
};


// ─────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────

/**
 * Standard "can't determine" response
 */
const buildErrorResponse = (reason) => ({
    compatible:               null,
    confidence:               "low",
    detection_method:         "none",
    requires_manual_selection: true,
    reason
});