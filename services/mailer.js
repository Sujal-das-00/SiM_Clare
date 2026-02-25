import axios from "axios";


import dotenv from 'dotenv'
import logger from "../utils/looger.js";
import AppError from "../utils/Apperror.js";
dotenv.config()

export const sendMail = async (name, email, otp) => {
    try {
        const response = await axios.post(
            "https://control.msg91.com/api/v5/email/send",
            {
                recipients: [
                    {
                        to: [
                            {
                                name,
                                email
                            }
                        ],
                        variables: {
                            name,
                            otp
                        }
                    }
                ],
                from: {
                    name: "SiM Claire",
                    email: process.env.MSG91_SENDER_EMAIL
                },
                domain: process.env.MSG91_DOMAIN,
                reply_to: [
                    {
                        email: process.env.MSG91_SENDER_EMAIL
                    }
                ],
                template_id: process.env.MSG91_TEMPLATE_ID,
                validate_before_send: false
            },
            {
                headers: {
                    accept: "application/json",
                    authkey: process.env.MSG91_API_KEY,
                    "content-type": "application/json"
                },
                timeout: 10000
            }
        );
        // console.log("OTP email sent successfully", {
        //     email,
        //     messageId: response.data
        // })
        console.log("OTP email sent successfully");

        return ({ status: 'success' });
    } catch (error) {

        logger.error("MSG91 Email Failed", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        throw new AppError(500, "Email could not be sent");
    }
};