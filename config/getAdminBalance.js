import axios from "axios";
import dotenv from "dotenv"
import GetAdminJwt from "./Adminauth.js";
dotenv.config();

export const getAdminBalance = async () => {
    try {
        const token = await GetAdminJwt();
        if (!token) {
            getAdminAuthToken();
            console.log("token not found retrying..")
        }

        const response = await axios.get(
            "https://api.esimaccess.com/api/v1/open/esim/balance",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                },
                timeout: 15000
            }
        );

        // Adjust this path if provider response shape differs
        return{ 
            balance:response.balance,
            currency:response.currency
        };

    } catch (error) {
        const status = error.response?.status;
        const data = error.response?.data;
        throw new Error(
            `Failed to fetch admin balance${status ? ` (HTTP ${status})` : ""}: ${
                data ? JSON.stringify(data) : error.message
            }`
        );
    }
};
