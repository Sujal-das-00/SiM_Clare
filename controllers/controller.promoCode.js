import db from "../config/db.js"
import { handelResponse } from '../utils/errorHandeler.js';
export async function createPromoCode(req, res, next) {
    try {
        const {
            code,
            discount_type,
            discount_value,
            max_discount = null,
            min_order_amount = 0,
            usage_limit = null,
            user_usage_limit = 1,
            valid_from = null,
            valid_until = null,
            is_first_order_only = false,
            country_code = null,
            sim_type = null,
            is_active = true,
        } = req.body;

        // ── 1. Validate payload ───────────────────────────────────
        const errors = validatePromoPayload(req.body);
        if (errors.length > 0) {
            return handelResponse(res, 400, "Validation failed")
        }

        // ── 2. Check code uniqueness ──────────────────────────────
        const [existing] = await db.query(
            'SELECT id FROM promo_codes WHERE code = ?',
            [code.trim().toUpperCase()]
        );

        if (existing.length > 0) {
            return handelResponse(res, 409, "promo code already exists. ")
        }

        // ── 3. Insert ─────────────────────────────────────────────
        const [result] = await db.query(
            `INSERT INTO promo_codes
                (code, discount_type, discount_value, max_discount,
                 min_order_amount, usage_limit, user_usage_limit,
                 valid_from, valid_until, is_first_order_only,
                 country_code, sim_type, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                code.trim().toUpperCase(),
                discount_type,
                discount_value,
                max_discount,
                min_order_amount,
                usage_limit,
                user_usage_limit,
                valid_from ? new Date(valid_from) : null,
                valid_until ? new Date(valid_until) : null,
                is_first_order_only,
                country_code,
                sim_type,
                is_active,
            ]
        );
        const [rows] = await db.query(
            'SELECT * FROM promo_codes WHERE id = ?',
            [result.insertId]
        );

        return handelResponse(res, 201, "Promocode created successfully ", rows[0])

    } catch (error) {
        console.error('[createPromoCode]', error);
        next(error)
    }
}


function validatePromoPayload(body) {
    const errors = [];
    const {
        code,
        discount_type,
        discount_value,
        max_discount,
        min_order_amount,
        usage_limit,
        user_usage_limit,
        valid_from,
        valid_until,
        is_first_order_only,
        country_code,
        sim_type,
        is_active,
    } = body;

    // ── Required fields ──────────────────────────────────────────
    if (!code || typeof code !== 'string' || code.trim() === '') {
        errors.push('code is required and must be a non-empty string.');
    }

    if (!['percentage', 'flat'].includes(discount_type)) {
        errors.push("discount_type must be 'percentage' or 'flat'.");
    }

    if (discount_value === undefined || isNaN(Number(discount_value)) || Number(discount_value) <= 0) {
        errors.push('discount_value must be a positive number.');
    }

    // ── Percentage-specific rules ─────────────────────────────────
    if (discount_type === 'percentage') {
        if (Number(discount_value) > 100) {
            errors.push('discount_value cannot exceed 100 for percentage type.');
        }
    }

    // ── max_discount only valid for percentage ────────────────────
    if (max_discount !== undefined && max_discount !== null) {
        if (discount_type === 'flat') {
            errors.push('max_discount is only applicable for percentage discount type.');
        }
        if (isNaN(Number(max_discount)) || Number(max_discount) <= 0) {
            errors.push('max_discount must be a positive number.');
        }
    }

    if (min_order_amount !== undefined && (isNaN(Number(min_order_amount)) || Number(min_order_amount) < 0)) {
        errors.push('min_order_amount must be a non-negative number.');
    } if (usage_limit !== undefined && usage_limit !== null) {
        if (!Number.isInteger(Number(usage_limit)) || Number(usage_limit) <= 0) {
            errors.push('usage_limit must be a positive integer.');
        }
    }
    if (user_usage_limit !== undefined) {
        if (!Number.isInteger(Number(user_usage_limit)) || Number(user_usage_limit) <= 0) {
            errors.push('user_usage_limit must be a positive integer.');
        }
    }
    if (valid_from && isNaN(Date.parse(valid_from))) {
        errors.push('valid_from must be a valid date.');
    }
    if (valid_until && isNaN(Date.parse(valid_until))) {
        errors.push('valid_until must be a valid date.');
    }
    if (valid_from && valid_until && new Date(valid_from) >= new Date(valid_until)) {
        errors.push('valid_from must be before valid_until.');
    }
    if (is_first_order_only !== undefined && typeof is_first_order_only !== 'boolean') {
        errors.push('is_first_order_only must be a boolean.');
    }
    if (is_active !== undefined && typeof is_active !== 'boolean') {
        errors.push('is_active must be a boolean.');
    }
    return errors;
}