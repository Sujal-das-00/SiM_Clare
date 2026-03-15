import axios from "axios";
import logger from "../../utils/looger.js";
import GetAdminJwt from "../../config/Adminauth.js";


export const buyEsimFromProviderService = async (payload) => {
    try {

        const token = await GetAdminJwt();

        const isDev = process.env.NODE_ENV !== "production";

        const baseURL = isDev
            ? process.env.UAT_URL
            : process.env.PROD_URL;

        const response = await axios.post(
            `${baseURL}esim/purchaseesimasync`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;

    } catch (error) {
        const providerError = {
            message: error.message,
            status: error.response?.status || null,
            statusText: error.response?.statusText || null,
            data: error.response?.data || null
        };

        logger.error("Provider eSIM purchase error:", providerError);

        throw Object.assign(new Error("Provider purchase request failed"), {
            statusCode: error.response?.status || 500,
            providerError
        });
    }
};
