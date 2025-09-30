// const nodemailer = require('nodemailer');

// class EmailService {
//   constructor() {
//     this.transporter = nodemailer.createTransport({
//       host: process.env.ZOHO_MAIL_HOST,
//       port: process.env.ZOHO_MAIL_PORT,
//       secure: true, 
//       auth: {
//         user: process.env.ZOHO_MAIL_USER,
//         pass: process.env.ZOHO_MAIL_PASS
//       },
//       tls: {
//         rejectUnauthorized: false
//       }
//     });
//   }

//   // Verify email configuration
//   async verifyConnection() {
//     try {
//       await this.transporter.verify();
//       console.log('Email service is ready to send messages');
//       return true;
//     } catch (error) {
//       console.error('Email service verification failed:', error);
//       return false;
//     }
//   }

//   // Send confirmation email to the registrant
//   async sendConfirmationEmail(registration) {
//     const emailTemplate = this.getConfirmationEmailTemplate(registration);
    
//     try {
//       const info = await this.transporter.sendMail({
//         from: `"Niger Delta Climate Summit" <${process.env.ZOHO_MAIL_USER}>`,
//         to: registration.email,
//         subject: 'Registration Confirmation - Niger Delta Climate & Technology Series 2025',
//         html: emailTemplate
//       });

//       console.log('Confirmation email sent:', info.messageId);
//       return { success: true, messageId: info.messageId };
//     } catch (error) {
//       console.error('Failed to send confirmation email:', error);
//       return { success: false, error: error.message };
//     }
//   }

//   // Send notification email to admin
//   async sendAdminNotification(registration) {
//     const emailTemplate = this.getAdminEmailTemplate(registration);
    
//     try {
//       const info = await this.transporter.sendMail({
//         from: `"Niger Delta Climate Summit System" <${process.env.ZOHO_MAIL_USER}>`,
//         to: process.env.ZOHO_MAIL_USER,
//         subject: `New Registration: ${registration.registrationTypeFormatted} - ${registration.fullName}`,
//         html: emailTemplate
//       });

//       console.log('Admin notification sent:', info.messageId);
//       return { success: true, messageId: info.messageId };
//     } catch (error) {
//       console.error('Failed to send admin notification:', error);
//       return { success: false, error: error.message };
//     }
//   }

//   // Generate confirmation email template
//   getConfirmationEmailTemplate(registration) {
//     const registrationType = registration.registrationTypeFormatted;
//     const sponsorshipInfo = registration.sponsorshipTier ? 
//       `<p><strong>Sponsorship Tier:</strong> ${registration.getSponsorshipTierDescription()}</p>` : '';
//     const participationInfo = registration.participationType ? 
//       `<p><strong>Participation Type:</strong> ${registration.participationType}</p>` : '';
//     const projectInfo = registration.projectDescription ? 
//       `<p><strong>Project Description:</strong></p><p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">${registration.projectDescription}</p>` : '';

//     return `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="utf-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Registration Confirmation</title>
//       </head>
//       <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
//         <div style="background: linear-gradient(135deg, #0f766e, #eab308); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
//           <h1 style="margin: 0; font-size: 28px;">Niger Delta Climate & Technology Series 2025</h1>
//           <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Registration Confirmed</p>
//         </div>
        
//         <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
//           <h2 style="color: #0f766e; margin-top: 0;">Hello ${registration.fullName}!</h2>
          
//           <p>Thank you for registering for the Niger Delta Climate & Technology Series 2025. Your registration as <strong>${registrationType}</strong> has been successfully received.</p>
          
//           <div style="background: #f0fdfa; border-left: 4px solid #0f766e; padding: 20px; margin: 20px 0;">
//             <h3 style="margin-top: 0; color: #0f766e;">Registration Details</h3>
//             <p><strong>Name:</strong> ${registration.fullName}</p>
//             <p><strong>Email:</strong> ${registration.email}</p>
//             <p><strong>Phone:</strong> ${registration.phone}</p>
//             ${registration.organization ? `<p><strong>Organization:</strong> ${registration.organization}</p>` : ''}
//             <p><strong>Registration Type:</strong> ${registrationType}</p>
//             ${sponsorshipInfo}
//             ${participationInfo}
//             ${projectInfo}
//             <p><strong>Registration Date:</strong> ${new Date(registration.submissionDate).toLocaleDateString('en-US', { 
//               weekday: 'long', 
//               year: 'numeric', 
//               month: 'long', 
//               day: 'numeric' 
//             })}</p>
//           </div>
          
//           <div style="background: #fffbeb; border: 1px solid #fbbf24; border-radius: 5px; padding: 20px; margin: 20px 0;">
//             <h3 style="margin-top: 0; color: #92400e;">Event Details</h3>
//             <p><strong>Date:</strong> October 21-22, 2025</p>
//             <p><strong>Location:</strong> Port Harcourt, Rivers State, Nigeria</p>
//             <p><strong>Time:</strong> 9:00 AM WAT</p>
//           </div>
          
//           <h3 style="color: #0f766e;">What's Next?</h3>
//           <ul style="padding-left: 20px;">
//             <li>You'll receive updates about the event schedule and speakers</li>
//             ${registration.registrationType === 'anchor-partner' ? '<li>Our partnerships team will contact you within 2 business days</li>' : ''}
//             ${registration.registrationType === 'series-venture' ? '<li>You will be contacted about the Guided Labs program details</li>' : ''}
//             <li>Event logistics and venue information will be shared closer to the date</li>
//             <li>Join our community updates for exclusive content and networking opportunities</li>
//           </ul>
          
//           <div style="text-align: center; margin: 30px 0;">
//             <p style="margin: 0; color: #6b7280;">For questions or support, contact us at:</p>
//             <p style="margin: 5px 0; color: #0f766e; font-weight: bold;">uduak@impactdriver.org</p>
//             <p style="margin: 5px 0; color: #0f766e; font-weight: bold;">+234 803-555-3875</p>
//           </div>
//         </div>
        
//         <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
//           <p>© 2025 Niger Delta Climate & Technology Series. All rights reserved.</p>
//           <p>Powered by Impact Driver Nigeria</p>
//         </div>
//       </body>
//       </html>
//     `;
//   }

//   // Generate admin notification email template
//   getAdminEmailTemplate(registration) {
//     const registrationType = registration.registrationTypeFormatted;
//     const sponsorshipInfo = registration.sponsorshipTier ? 
//       `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Sponsorship Tier:</td><td style="padding: 8px; border: 1px solid #ddd;">${registration.getSponsorshipTierDescription()}</td></tr>` : '';
//     const participationInfo = registration.participationType ? 
//       `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Participation Type:</td><td style="padding: 8px; border: 1px solid #ddd;">${registration.participationType}</td></tr>` : '';
//     const projectInfo = registration.projectDescription ? 
//       `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; vertical-align: top;">Project Description:</td><td style="padding: 8px; border: 1px solid #ddd;">${registration.projectDescription}</td></tr>` : '';

//     return `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="utf-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>New Registration Notification</title>
//       </head>
//       <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
//         <div style="background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 5px;">
//           <h1 style="margin: 0;">New Registration Alert</h1>
//           <p style="margin: 5px 0 0 0;">Niger Delta Climate & Technology Series 2025</p>
//         </div>
        
//         <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; margin-top: 20px;">
//           <h2 style="color: #dc2626; margin-top: 0;">Registration Details</h2>
          
//           <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
//             <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Registration Type:</td><td style="padding: 8px; border: 1px solid #ddd; background-color: #fef2f2;">${registrationType}</td></tr>
//             <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Name:</td><td style="padding: 8px; border: 1px solid #ddd;">${registration.fullName}</td></tr>
//             <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email:</td><td style="padding: 8px; border: 1px solid #ddd;">${registration.email}</td></tr>
//             <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Phone:</td><td style="padding: 8px; border: 1px solid #ddd;">${registration.phone}</td></tr>
//             ${registration.organization ? `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Organization:</td><td style="padding: 8px; border: 1px solid #ddd;">${registration.organization}</td></tr>` : ''}
//             ${sponsorshipInfo}
//             ${participationInfo}
//             ${projectInfo}
//             <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Submission Date:</td><td style="padding: 8px; border: 1px solid #ddd;">${new Date(registration.submissionDate).toLocaleString()}</td></tr>
//             <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">IP Address:</td><td style="padding: 8px; border: 1px solid #ddd;">${registration.ipAddress || 'Not captured'}</td></tr>
//           </table>
          
//           <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin-top: 20px;">
//             <h3 style="margin-top: 0;">Next Steps:</h3>
//             <ul>
//               ${registration.registrationType === 'anchor-partner' ? '<li>Follow up on partnership opportunities within 2 business days</li>' : ''}
//               ${registration.registrationType === 'series-venture' ? '<li>Review project description and consider for Guided Labs program</li>' : ''}
//               <li>Add to appropriate mailing list and communication workflows</li>
//               <li>Update CRM or tracking system as needed</li>
//             </ul>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;
//   }
// }

// module.exports = new EmailService();