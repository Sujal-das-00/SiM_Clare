import {
    createProvisioningRecord,
    getProvisioningByOrderId,
    updateProvisioningStatus,
    incrementRetry
} from "../models/providerEsimProvisioningModel.js";


/**
 * Create provisioning entry
 */
export const createProvisioning = async (req, res) => {

    try {

        const id = await createProvisioningRecord(req.body);

        res.status(201).json({
            success: true,
            provisioning_id: id
        });

    } catch (error) {

        console.error("Provisioning create error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create provisioning record"
        });

    }

};


/**
 * Get provisioning by order id
 */
export const getProvisioning = async (req, res) => {

    try {

        const { order_id } = req.params;

        const data = await getProvisioningByOrderId(order_id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Provisioning record not found"
            });
        }

        res.json({
            success: true,
            data
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

};


/**
 * Update provisioning status
 */
export const updateStatus = async (req, res) => {

    try {

        const { id } = req.params;
        const { status } = req.body;

        await updateProvisioningStatus(id, status);

        res.json({
            success: true,
            message: "Status updated"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update status"
        });

    }

};


/**
 * Retry provisioning
 */
export const retryProvisioning = async (req, res) => {

    try {

        const { id } = req.params;

        await incrementRetry(id);

        res.json({
            success: true,
            message: "Retry count incremented"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Retry update failed"
        });

    }

};