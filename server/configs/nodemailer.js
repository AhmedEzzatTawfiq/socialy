import nodemailer from "nodemailer";

const createTransporter = () => {
    return nodemailer.createTransport({
        host: "smtp.mailersend.net",
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

export const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };

        const result = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", result.messageId);
        return result;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};



export const sendWelcomeEmail = async (userEmail, userName) => {
    const subject = "Welcome to Socialy!";
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to Socialy, ${userName}!</h2>
            <p>Thank you for joining our community. We're excited to have you on board!</p>
            <div style="margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}" 
                   style="background-color: #28a745; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 4px; display: inline-block;">
                    Get Started
                </a>
            </div>
            <h3 style="color: #333;">What you can do on Socialy:</h3>
            <ul style="color: #666;">
                <li>Connect with friends and colleagues</li>
                <li>Share updates and photos</li>
                <li>Discover new people in your network</li>
                <li>Build professional relationships</li>
            </ul>
            <p style="color: #666; font-size: 14px;">
                If you have any questions, feel free to reach out to our support team.
            </p>
        </div>
    `;
    
    return await sendEmail({
        to: userEmail,
        subject,
        html
    });
};

export default {
    sendEmail,
    sendWelcomeEmail
};
