const nodemailer = require("nodemailer");

const sendMail = async (to, subject, text, html) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: "Reset Your Password  < uYn3T@example.com>",
            to: to,
            subject: subject,
            text: text,
            html: html,
        });

        console.log("Message sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error: error.message };
    }
};

module.exports = sendMail;
