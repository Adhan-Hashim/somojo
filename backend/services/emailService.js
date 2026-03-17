const nodemailer = require('nodemailer');

let transporter = null;
let isInitializing = false;

// Initialize the transport mechanism asynchronously
const initTransport = async () => {
    if (transporter) return transporter;
    if (isInitializing) {
        // Wait for it to finish if already in progress
        while (isInitializing) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return transporter;
    }

    isInitializing = true;
    try {
        // If real SMTP variables are provided, use them
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            console.log(`Initializing SMTP with host: ${process.env.SMTP_HOST}, port: ${process.env.SMTP_PORT}, user: ${process.env.SMTP_USER}`);
            const transportConfig = {
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
                debug: true,
                logger: true
            };

            if (process.env.SMTP_HOST?.includes('gmail.com')) {
                transportConfig.service = 'gmail';
            } else {
                transportConfig.host = process.env.SMTP_HOST;
                transportConfig.port = parseInt(process.env.SMTP_PORT) || 587;
                transportConfig.secure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT == 465;
            }

            transporter = nodemailer.createTransport(transportConfig);
            console.log("Real SMTP transporter created. Verifying connection...");
            await transporter.verify();
            console.log("✅ SMTP connection verified successfully.");
        } else {
            // Otherwise, generate a fake Ethereal email account for testing
            console.log("No SMTP credentials found in .env. Generating a test Ethereal Email account...");
            let testAccount = await nodemailer.createTestAccount();

            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user, // generated ethereal user
                    pass: testAccount.pass, // generated ethereal password
                },
            });
            console.log("Ethereal test email transporter initialized.");
        }
    } catch (error) {
        console.error("❌ SMTP Initialization/Verification failed:", error);
        transporter = null;
    } finally {
        isInitializing = false;
    }
    return transporter;
};

// Start initialization immediately
initTransport();

/**
 * Send an OTP code to a user's email address
 * @param {string} toEmail 
 * @param {string} otpCode 
 * @param {string} userName
 */
exports.sendOTPEmail = async (toEmail, otpCode, userName = "there") => {
    const mailOptions = {
        from: `"Somojo Accounts" <${process.env.SMTP_USER || 'no-reply@somojo.com'}>`,
        to: toEmail,
        subject: "Your Somojo Verification Code",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #5CB144;">Welcome to Somojo!</h2>
                <p>Hi ${userName},</p>
                <p>Thank you for registering. Please use the following 6-digit code to verify your email address and complete your registration:</p>
                <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <h1 style="letter-spacing: 5px; margin: 0; color: #000;">${otpCode}</h1>
                </div>
                <p>This code will expire in 15 minutes.</p>
                <p>If you did not request this code, please ignore this email.</p>
                <br/>
                <p>Thanks,<br/>The Somojo Team</p>
            </div>
        `,
        text: `Hi ${userName}, Your Somojo Verification Code is: ${otpCode}. It expires in 15 minutes.`
    };

    try {
        if (!transporter) await initTransport();
        if (!transporter) {
            throw new Error("SMTP Transporter not initialized. Check server logs.");
        }

        let info = await transporter.sendMail(mailOptions);

        console.log(`OTP Email sent successfully to ${toEmail}`);

        // If we used the fallback test account, print the URL where they can view it
        if (!process.env.SMTP_HOST) {
            console.log("==========================================================");
            console.log("📫 PREVIEW YOUR EMAIL AT THIS LINK: %s", nodemailer.getTestMessageUrl(info));
            console.log("==========================================================");
        }
    } catch (error) {
        console.error("Error sending OTP email:", error);
        throw error; // Rethrow to let the controller handle failure logic
    }
};

/**
 * Send an email confirmation to the job seeker after applying
 * @param {string} seekerEmail 
 * @param {string} seekerName 
 * @param {object} job 
 */
exports.sendApplicationConfirmation = async (seekerEmail, seekerName, job) => {
    const mailOptions = {
        from: `"Somojo Notifications" <${process.env.SMTP_USER || 'no-reply@somojo.com'}>`,
        to: seekerEmail,
        subject: `Application Received: ${job.title} at ${job.company}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
                <h2 style="color: #CF9EFF;">Application Confirmed!</h2>
                <p>Hi ${seekerName},</p>
                <p>You've successfully applied for the position of <strong>${job.title}</strong> at <strong>${job.company}</strong>.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #CF9EFF;">
                    <p style="margin: 5px 0;"><strong>Job:</strong> ${job.title}</p>
                    <p style="margin: 5px 0;"><strong>Company:</strong> ${job.company}</p>
                    <p style="margin: 5px 0;"><strong>Location:</strong> ${job.location}</p>
                </div>
                <p>The employer will review your application soon. You can track your application status on your dashboard.</p>
                <br/>
                <p>Good luck!<br/>The Somojo Team</p>
            </div>
        `
    };

    try {
        if (!transporter) await initTransport();
        let info = await transporter.sendMail(mailOptions);
        console.log(`Confirmation Email sent toseeker: ${seekerEmail}`);
        if (!process.env.SMTP_HOST) console.log("📫 PREVIEW: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending confirmation email:", error);
    }
};

/**
 * Notify the employer that a new candidate has applied
 * @param {string} employerEmail 
 * @param {string} employerName 
 * @param {string} seekerName 
 * @param {object} job 
 */
exports.sendEmployerNotification = async (employerEmail, employerName, seekerName, job) => {
    const mailOptions = {
        from: `"Somojo Notifications" <${process.env.SMTP_USER || 'no-reply@somojo.com'}>`,
        to: employerEmail,
        subject: `New Applicant for ${job.title}: ${seekerName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
                <h2 style="color: #5CB144;">New Application Received</h2>
                <p>Hi ${employerName || 'Employer'},</p>
                <p>Great news! <strong>${seekerName}</strong> has just applied for your job opening: <strong>${job.title}</strong>.</p>
                <div style="margin: 20px 0; text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background-color: #5CB144; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Application</a>
                </div>
                <p>Log in to your dashboard to view their profile, resume, and AI match score.</p>
                <br/>
                <p>Happy hiring,<br/>The Somojo Team</p>
            </div>
        `
    };

    try {
        if (!transporter) await initTransport();
        let info = await transporter.sendMail(mailOptions);
        console.log(`Employer Notification sent to: ${employerEmail}`);
        if (!process.env.SMTP_HOST) console.log("📫 PREVIEW: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending employer email:", error);
    }
};

/**
 * Notify job seeker of a status update (Accepted/Rejected)
 * @param {string} seekerEmail 
 * @param {string} seekerName 
 * @param {object} job 
 * @param {string} status 
 */
exports.sendApplicationStatusUpdate = async (seekerEmail, seekerName, job, status) => {
    const isAccepted = status.toLowerCase() === 'accepted';
    const mainColor = isAccepted ? '#5CB144' : '#e53e3e';
    const title = isAccepted ? 'Good News!' : 'Application Update';
    const message = isAccepted
        ? `We are pleased to inform you that your application for <strong>${job.title}</strong> has been <strong>Accepted</strong>! The employer will contact you soon with next steps.`
        : `Thank you for your interest in the <strong>${job.title}</strong> position. Unfortunately, the employer has decided not to move forward with your application at this time.`;

    const mailOptions = {
        from: `"Somojo Notifications" <${process.env.SMTP_USER || 'no-reply@somojo.com'}>`,
        to: seekerEmail,
        subject: `Update on your application: ${job.title} at ${job.company}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
                <h2 style="color: ${mainColor};">${title}</h2>
                <p>Hi ${seekerName},</p>
                <p>${message}</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${mainColor};">
                    <p style="margin: 5px 0;"><strong>Job:</strong> ${job.title}</p>
                    <p style="margin: 5px 0;"><strong>Company:</strong> ${job.company}</p>
                    <p style="margin: 5px 0;"><strong>New Status:</strong> <span style="color: ${mainColor}; text-transform: uppercase;">${status}</span></p>
                </div>
                <p>Best regards,<br/>The Somojo Team</p>
            </div>
        `
    };

    try {
        if (!transporter) await initTransport();
        let info = await transporter.sendMail(mailOptions);
        console.log(`Status Update Email sent (${status}) to: ${seekerEmail}`);
        if (!process.env.SMTP_HOST) console.log("📫 PREVIEW: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending status update email:", error);
    }
};

/**
 * Notify job seeker that they have received a new message from an employer
 * @param {string} seekerEmail 
 * @param {string} seekerName 
 * @param {object} job 
 * @param {string} messageContent
 */
exports.sendCandidateMessageNotification = async (seekerEmail, seekerName, job, messageContent) => {
    const mailOptions = {
        from: `"Somojo Notifications" <${process.env.SMTP_USER || 'no-reply@somojo.com'}>`,
        to: seekerEmail,
        subject: `New message regarding your application: ${job.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
                <h2 style="color: #CF9EFF;">New Message from Employer</h2>
                <p>Hi ${seekerName},</p>
                <p>The employer for <strong>${job.title}</strong> has sent you a message:</p>
                <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0; font-style: italic; border-left: 4px solid #CF9EFF;">
                    "${messageContent}"
                </div>
                <div style="margin: 20px 0; text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background-color: #CF9EFF; color: black; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Details on Dashboard</a>
                </div>
                <p>You can view the full application history and reply via your dashboard.</p>
                <br/>
                <p>Best regards,<br/>The Somojo Team</p>
            </div>
        `
    };

    try {
        if (!transporter) await initTransport();
        let info = await transporter.sendMail(mailOptions);
        console.log(`Message Notification Email sent to: ${seekerEmail}`);
        if (!process.env.SMTP_HOST) console.log("📫 PREVIEW: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending message notification email:", error);
    }
};
/**
 * Notify the site admin that a new job has been posted and requires approval
 * @param {string} adminEmail 
 * @param {object} job 
 * @param {object} employer 
 */
exports.sendAdminJobNotification = async (adminEmail, job, employer) => {
    const adminUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin`;
    const mailOptions = {
        from: `"Somojo System" <${process.env.SMTP_USER || 'no-reply@somojo.com'}>`,
        to: adminEmail,
        subject: `ACTION REQUIRED: New Job Posting Pending Approval - ${job.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e53e3e; border-radius: 10px; padding: 20px;">
                <h2 style="color: #e53e3e;">New Job Approval Requested</h2>
                <p>Hello Admin,</p>
                <p>A new job posting has been submitted by <strong>${employer.name}</strong> (${employer.email}) and requires your review before it can be listed publicly.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e53e3e;">
                    <p style="margin: 5px 0;"><strong>Job Title:</strong> ${job.title}</p>
                    <p style="margin: 5px 0;"><strong>Company:</strong> ${job.company}</p>
                    <p style="margin: 5px 0;"><strong>Location:</strong> ${job.location}</p>
                    <p style="margin: 5px 0;"><strong>Posted At:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <div style="margin: 20px 0; text-align: center;">
                    <a href="${adminUrl}" style="background-color: #e53e3e; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Admin Portal to Approve</a>
                </div>
                <p>Please review the listing carefully to ensure it meets platform standards.</p>
                <br/>
                <p>System Notification,<br/>The Somojo Engine</p>
            </div>
        `
    };

    try {
        if (!transporter) await initTransport();
        let info = await transporter.sendMail(mailOptions);
        console.log(`Admin Job Notification sent to: ${adminEmail}`);
        if (!process.env.SMTP_HOST) console.log("📫 PREVIEW: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending admin job notification email:", error);
    }
};
/**
 * Notify job seeker that they have saved a job
 * @param {string} seekerEmail 
 * @param {string} seekerName 
 * @param {object} job 
 */
exports.sendJobSavedNotification = async (seekerEmail, seekerName, job) => {
    const mailOptions = {
        from: `"Somojo Notifications" <${process.env.SMTP_USER || 'no-reply@somojo.com'}>`,
        to: seekerEmail,
        subject: `Job Saved: ${job.title} at ${job.company}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
                <h2 style="color: #6366f1;">Job Saved! 📌</h2>
                <p>Hi ${seekerName || 'there'},</p>
                <p>You've successfully saved the position of <strong>${job.title}</strong> at <strong>${job.company}</strong> for later.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
                    <p style="margin: 5px 0;"><strong>Job:</strong> ${job.title}</p>
                    <p style="margin: 5px 0;"><strong>Company:</strong> ${job.company}</p>
                    <p style="margin: 5px 0;"><strong>Location:</strong> ${job.location || 'Not specified'}</p>
                </div>
                <p>You can find this job and apply when you're ready in your <strong>"My Jobs"</strong> section.</p>
                <div style="margin: 20px 0; text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background-color: #6366f1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Saved Jobs</a>
                </div>
                <br/>
                <p>Best of luck with your search!<br/>The Somojo Team</p>
            </div>
        `
    };

    try {
        if (!transporter) await initTransport();
        await transporter.sendMail(mailOptions);
        console.log(`Job Saved Notification sent to: ${seekerEmail}`);
    } catch (error) {
        console.error("Error sending job saved notification:", error);
    }
};

/**
 * Send the agreement draft to the candidate for review
 */
exports.sendAgreementToCandidate = async (seekerEmail, seekerName, job, agreementContent) => {
    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`;
    const mailOptions = {
        from: `"Somojo Agreements" <${process.env.SMTP_USER || 'no-reply@somojo.com'}>`,
        to: seekerEmail,
        subject: `ACTION REQUIRED: Employment Agreement for ${job.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #CF9EFF; border-radius: 10px; padding: 20px;">
                <h2 style="color: #CF9EFF;">Review Your Agreement</h2>
                <p>Hi ${seekerName},</p>
                <p>Congratulations! <strong>${job.company}</strong> has prepared an employment agreement for the <strong>${job.title}</strong> position.</p>
                <p>Please log in to your dashboard to review the terms and accept the agreement.</p>
                <div style="margin: 20px 0; text-align: center;">
                    <a href="${dashboardUrl}" style="background-color: #CF9EFF; color: black; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View & Accept Agreement</a>
                </div>
                <p>Best regards,<br/>The Somojo Team</p>
            </div>
        `
    };

    try {
        if (!transporter) await initTransport();
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending agreement email:", error);
    }
};

/**
 * Send finalized agreement copies to both parties
 */
exports.sendFinalAgreementCopies = async (emails, job, agreementContent) => {
    const mailOptions = {
        from: `"Somojo Agreements" <${process.env.SMTP_USER || 'no-reply@somojo.com'}>`,
        to: emails,
        subject: `FINALIZED: Signed Agreement for ${job.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #5CB144; border-radius: 10px; padding: 20px;">
                <h2 style="color: #5CB144;">Contract Officially Signed! 🎉</h2>
                <p>This is a finalized copy of the employment agreement between the candidate and the employer for <strong>${job.title}</strong>.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
                <div style="white-space: pre-wrap; font-family: monospace; background: #f9f9f9; padding: 15px; border-radius: 5px;">
                    ${agreementContent}
                </div>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
                <p>This document is stored in your Somojo dashboard for future reference.</p>
                <p>Best regards,<br/>The Somojo Team</p>
            </div>
        `
    };

    try {
        if (!transporter) await initTransport();
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending final agreement copies:", error);
    }
};
