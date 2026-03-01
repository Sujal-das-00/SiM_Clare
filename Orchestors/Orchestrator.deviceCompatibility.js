import { findExactMatch, findPrefixMatch, getCountryOverride, logDetection } from "../models/models.deviceCompatiblity.js";
import { parseUserAgent } from "../services/service.uaParser.js";

const normalizeModel = (model) => {
    if (!model) return null;
    return model.replace(/([A-Z])$/, "");
};

export const deviceCompatibilityFlow = async ({ userAgent, country }) => {

    const parsed = parseUserAgent(userAgent);

    const model = parsed.model;
    const os = parsed.os;
    const osVersion = parseFloat(parsed.osVersion);
    console.log(model)
    if (!model) {
        return {
            compatible: null,
            confidence: "low",
            detection_method: "none",
            requires_manual_selection: true,
            reason: "Device model not detected"
        };
    }

    const normalizedModel = normalizeModel(model);

    let device = await findExactMatch(normalizedModel, os, osVersion);
    let detectionMethod = null;
    let confidence = null;

    if (device) {
        detectionMethod = "exact_variant";
        confidence = "high";
    }

    if (!device) {
        device = await findPrefixMatch(normalizedModel, os, osVersion);
        if (device) {
            detectionMethod = "prefix_match";
            confidence = "high";
        }
    }

    if (!device) {
        return {
            compatible: null,
            confidence: "low",
            detection_method: "none",
            requires_manual_selection: true,
            reason: "Device not found in database"
        };
    }

    const override = await getCountryOverride(device.variant_id, country);

    let esimEnabled = device.esim_supported;

    if (override && override.esim_enabled === false) {
        esimEnabled = false;
    }

    const response = {
        compatible: esimEnabled,
        confidence,
        detection_method: detectionMethod,
        device: {
            brand: device.brand,
            family: device.family_name,
            variant: normalizedModel
        },
        os: {
            name: os,
            version: osVersion
        },
        reason: esimEnabled
            ? "Device supports eSIM"
            : "eSIM disabled for this region",
        requires_manual_selection: false
    };

    await logDetection({
        userAgent,
        detectedModel: normalizedModel,
        detectedOs: os,
        compatible: esimEnabled,
        confidence,
        detectionMethod
    });

    return response;
};