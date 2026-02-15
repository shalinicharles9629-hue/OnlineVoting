const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Send candidate approval email
const sendApprovalEmail = async (candidateEmail, candidateName, electionTitle) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Election Commission" <noreply@elections.gov.in>',
            to: candidateEmail,
            subject: '🎉 Candidate Application Approved - Election Commission',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                        .icon { font-size: 48px; margin-bottom: 10px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="icon">🇮🇳</div>
                            <h1>Congratulations!</h1>
                        </div>
                        <div class="content">
                            <h2>Dear ${candidateName},</h2>
                            <p>We are pleased to inform you that your candidate application has been <strong>approved</strong> by the Election Commission.</p>
                            
                            <p><strong>Election Details:</strong></p>
                            <ul>
                                <li>Election: ${electionTitle || 'General Elections 2026'}</li>
                                <li>Status: Approved ✅</li>
                            </ul>

                            <p><strong>Next Steps:</strong></p>
                            <ol>
                                <li>Your party symbol will be assigned by the admin shortly</li>
                                <li>You will be able to participate in the election once it begins</li>
                                <li>Voters will be able to see your profile and manifesto</li>
                            </ol>

                            <p>You can log in to your dashboard to view your application status and assigned symbol.</p>

                            <p style="margin-top: 30px;">Best wishes for your campaign!</p>
                            <p><strong>Election Commission of India</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message. Please do not reply to this email.</p>
                            <p>&copy; 2026 Election Commission of India. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Approval email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending approval email:', error);
        return { success: false, error: error.message };
    }
};

// Send candidate rejection email
const sendRejectionEmail = async (candidateEmail, candidateName, rejectionReason) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Election Commission" <noreply@elections.gov.in>',
            to: candidateEmail,
            subject: 'Candidate Application Status - Election Commission',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                        .reason-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Application Status Update</h1>
                        </div>
                        <div class="content">
                            <h2>Dear ${candidateName},</h2>
                            <p>Thank you for your interest in participating in the upcoming elections.</p>
                            
                            <p>After careful review, we regret to inform you that your candidate application has not been approved at this time.</p>
                            
                            <div class="reason-box">
                                <strong>Reason:</strong><br>
                                ${rejectionReason || 'Application did not meet the required criteria.'}
                            </div>

                            <p>You may reapply in future elections after addressing the concerns mentioned above.</p>

                            <p style="margin-top: 30px;">Thank you for your understanding.</p>
                            <p><strong>Election Commission of India</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message. Please do not reply to this email.</p>
                            <p>&copy; 2026 Election Commission of India. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Rejection email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending rejection email:', error);
        return { success: false, error: error.message };
    }
};

const sendOTPEmail = async (email, otp) => {
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Election Commission" <noreply@elections.gov.in>',
            to: email,
            subject: '🔐 Your Secure Voting OTP - Election Commission',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <span style="font-size: 40px;">🇮🇳</span>
                        <h1 style="color: #1e40af; margin-top: 10px;">Election Commission of India</h1>
                    </div>
                    <div style="background-color: #f3f4f6; padding: 24px; border-radius: 8px; text-align: center;">
                        <p style="font-size: 16px; color: #4b5563; margin-bottom: 8px;">Your One-Time Password (OTP) for voting is:</p>
                        <h2 style="font-size: 48px; color: #111827; letter-spacing: 8px; margin: 0;">${otp}</h2>
                        <p style="font-size: 14px; color: #6b7280; margin-top: 16px;">This OTP will expire in 10 minutes. Do not share this code with anyone.</p>
                    </div>
                    <div style="margin-top: 24px; color: #6b7280; font-size: 12px; text-align: center;">
                        <p>This is a secure automated message. If you did not request this OTP, please ignore this email.</p>
                        <p>&copy; 2026 Election Commission of India</p>
                    </div>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendApprovalEmail,
    sendRejectionEmail,
    sendOTPEmail
};
