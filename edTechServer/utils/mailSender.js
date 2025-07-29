const nodemailer = require('nodemailer');

const mailSender = async(email, title, body) => {
    try {
        console.log("=== MAIL SENDER ===");
        console.log("Sending email to:", email);
        console.log("Subject:", title);
        console.log("Mail host:", process.env.MAIL_HOST);
        console.log("Mail user:", process.env.MAIL_USER);
        console.log("Mail pass exists:", !!process.env.MAIL_PASS);
        
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });

        let info = await transporter.sendMail({
            from: "simmijha1410@gmail.com",
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        });
        
        console.log("Email sent successfully:", info);
        return info;

    } catch (err) {
        console.log("=== MAIL SENDER ERROR ===");
        console.log("Error message:", err.message);
        console.log("Full error:", err);
        throw err; // Re-throw the error so it can be handled by the caller
    }
}

module.exports = mailSender;