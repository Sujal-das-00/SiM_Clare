import axios from "axios";
import logger from "../../utils/looger.js";
import GetAdminJwt from "../../config/Adminauth.js";

export const getEsimStatusService = async (purchaseId) => {
    try {
        const token = await GetAdminJwt();

        const isDev = process.env.NODE_ENV !== "production";
        const baseURL = isDev ? process.env.UAT_URL : process.env.PROD_URL;

        const response = await axios.post(
            `${baseURL}esim/esimstatus`,
            {
                purchaseID: String(purchaseId)
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;
    } catch (error) {
        logger.error("Provider eSIM status error:", {
            purchaseId,
            message: error.message,
            data: error.response?.data
        });

        throw error;
    }
};
