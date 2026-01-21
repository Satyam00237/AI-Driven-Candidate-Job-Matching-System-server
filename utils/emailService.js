const nodemailer = require("nodemailer");

// Create email transporter
// Using Gmail as an example - you can configure this for any email service
const createTransporter = () => {
    // Option 1: Brevo (Sendinblue) SMTP - Reliable and free
    if (process.env.EMAIL_SERVICE === 'brevo' && process.env.EMAIL_HOST) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    // Option 2: Gmail (requires App Password if 2FA is enabled)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && !process.env.EMAIL_SERVICE) {
        return nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    // Option 3: For testing without real email - uses Ethereal (fake SMTP)
    return null; // Will be created on-demand using Ethereal
};

// Send shortlist notification email
const sendShortlistEmail = async (candidateName, candidateEmail, jobTitle, recruiterName) => {
    try {
        let transporter = createTransporter();

        // If no transporter configured, create a test account
        if (!transporter) {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER || '"AI Recruitment Platform" <noreply@airecruitment.com>',
            to: candidateEmail,
            subject: `🎉 Congratulations! You've been shortlisted for ${jobTitle}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: #f9f9f9;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                        }
                        .highlight {
                            background: #e8f5e9;
                            padding: 15px;
                            border-left: 4px solid #11998e;
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            color: #666;
                            font-size: 12px;
                        }
                        .button {
                            display: inline-block;
                            background: #11998e;
                            color: white;
                            padding: 12px 30px;
                            text-decoration: none;
                            border-radius: 5px;
                            margin-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>🎯 AI Recruitment Platform</h1>
                        <h2>Shortlist Notification</h2>
                    </div>
                    <div class="content">
                        <p>Dear <strong>${candidateName}</strong>,</p>
                        
                        <p>We are pleased to inform you that you have been <strong>shortlisted</strong> for the following position:</p>
                        
                        <div class="highlight">
                            <h3 style="margin-top: 0; color: #11998e;">📋 ${jobTitle}</h3>
                            <p style="margin-bottom: 0;">Your application has been reviewed and selected by our recruitment team.</p>
                        </div>
                        
                        <p>Congratulations on making it to the next stage! Our team will contact you soon with further details about the next steps in the recruitment process.</p>
                        
                        <p><strong>What's Next?</strong></p>
                        <ul>
                            <li>Keep an eye on your email for further communication</li>
                            <li>Prepare for potential interviews or assessments</li>
                            <li>Review the job requirements once more</li>
                        </ul>
                        
                        <p>If you have any questions, please don't hesitate to reach out to us.</p>
                        
                        <p>Best regards,<br>
                        <strong>${recruiterName || 'The Recruitment Team'}</strong><br>
                        AI Recruitment Platform</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated email from AI Recruitment Platform. Please do not reply to this email.</p>
                        <p>&copy; ${new Date().getFullYear()} AI Recruitment Platform. All rights reserved.</p>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("✅ Email sent successfully!");
        console.log("Message ID:", info.messageId);
        console.log("Response:", info.response);
        console.log("Accepted:", info.accepted);
        console.log("Rejected:", info.rejected);

        // If using Ethereal (test), log the preview URL
        if (!process.env.EMAIL_SERVICE || process.env.EMAIL_SERVICE !== 'brevo') {
            console.log("📧 Email Preview URL:", nodemailer.getTestMessageUrl(info));
        }

        return {
            success: true,
            messageId: info.messageId,
            previewUrl: nodemailer.getTestMessageUrl(info),
        };
    } catch (error) {
        console.error("❌ Email sending error:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        return {
            success: false,
            error: error.message,
        };
    }
};

module.exports = {
    sendShortlistEmail,
};
