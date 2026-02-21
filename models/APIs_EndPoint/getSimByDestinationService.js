import axios from "axios";
import logger from "../../utils/looger.js";

export const getSimByDestinationService = async (token, des_id) => {
    try {
        const isDev = process.env.NODE_ENV !== "production";

        const baseURL = isDev
            ? process.env.UAT_URL
            : process.env.PROD_URL;

        const response = await axios.get(
            `${baseURL}esim/products`,
            {
                params: { destinationid: des_id },
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;

    } catch (error) {
        logger.error("eSIM API Error:", error.response?.data || error.message);
        throw error;
    }
};