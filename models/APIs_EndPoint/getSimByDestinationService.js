import axios from "axios";
import logger from "../../utils/looger.js";
import GetAdminJwt from "../../config/Adminauth.js";

export const getSimByDestinationService = async (des_id) => {
    try {
        const isDev = process.env.NODE_ENV !== "production";

        const baseURL = isDev
            ? process.env.UAT_URL
            : process.env.PROD_URL;
            console.log(process.env.PROD_URL)
        const token = await GetAdminJwt();
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
        return response;


    } catch (error) {
        logger.error("eSIM API Error:", error.response?.data || error.message);
        throw error;
    }
};