import nodemailer from "nodemailer";
import dotenv from 'dotenv'
dotenv.config()
export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }, tls: {
        family: 4 
    }
});

export const sendMail = async (to, otp) => {
    try {
        const info = await transporter.sendMail({
            from: `"OTP Verification" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: "Your OTP Code",
            text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>OTP Verification</h2>
                    <p>Your One-Time Password (OTP) is:</p>
                    <h1 style="color: #4CAF50;">${otp}</h1>
                    <p>This OTP will expire in <b>5 minutes</b>.</p>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
            `
        });

        console.log("Email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
