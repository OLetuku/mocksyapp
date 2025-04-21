import nodemailer from "nodemailer"

// Email configuration
const getEmailConfig = () => {
  return {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.EMAIL_PORT || "465"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER || "mocksyapp@gmail.com",
      pass: process.env.EMAIL_PASSWORD || "",
    },
  }
}

// Create transporter
const getTransporter = () => {
  return nodemailer.createTransport(getEmailConfig())
}

// Email templates
const getInvitationEmailTemplate = ({
  testTitle,
  testRole,
  testDuration,
  invitationLink,
  message,
  senderName,
  companyName,
  companyDescription,
  jobTitle,
  deadline,
  companyLogo,
  companyIndustry,
}) => {
  // Format deadline if provided
  const deadlineText = deadline
    ? `<p><strong>Please complete this assessment by:</strong> ${new Date(deadline).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>`
    : ""

  // Use company logo if provided, otherwise use text
  const logoSection = companyLogo
    ? `<img src="${companyLogo}" alt="${companyName} Logo" style="max-height: 60px; max-width: 200px; margin-bottom: 10px;" />`
    : `<h2 style="margin: 0; color: white;">${companyName}</h2>`

  // Industry badge if provided
  const industryBadge = companyIndustry
    ? `<span style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-top: 5px;">${companyIndustry}</span>`
    : ""

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Assessment Invitation from ${companyName}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .container { padding: 0; }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; background-color: #f9fafb; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; background-color: #f3f4f6; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 500; }
        .details { background-color: #fff; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .company-info { margin-top: 20px; font-style: italic; color: #6b7280; background-color: #f3f4f6; padding: 15px; border-radius: 6px; }
        .company-description { margin-top: 10px; line-height: 1.5; }
        .deadline { background-color: #fee2e2; color: #991b1b; padding: 10px; border-radius: 6px; margin-top: 15px; font-weight: 500; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${logoSection}
          ${industryBadge}
        </div>
        <div class="content">
          <p>Hello,</p>
          
          <p>We were impressed with your application for the <strong>${testRole}</strong> position at ${companyName}. As part of our interview process, we'd like to invite you to complete a practical assessment to better understand your skills and experience.</p>
          
          <div class="details">
            <p><strong>Assessment:</strong> ${testTitle}</p>
            <p><strong>Role:</strong> ${testRole}</p>
            <p><strong>Estimated Duration:</strong> ${testDuration} minutes</p>
            ${deadlineText}
          </div>
          
          <p>Message from ${senderName}, ${jobTitle} at ${companyName}:</p>
          <p style="white-space: pre-line;">${message}</p>
          
          ${deadline ? `<div class="deadline">Please complete this assessment by ${new Date(deadline).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>` : ""}
          
          <div style="text-align: center;">
            <a href="${invitationLink}" class="button">Start Assessment</a>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all;"><a href="${invitationLink}">${invitationLink}</a></p>
          
          ${
            companyDescription
              ? `
          <div class="company-info">
            <strong>About ${companyName}:</strong>
            <p class="company-description">${companyDescription}</p>
          </div>
          `
              : ""
          }
        </div>
        <div class="footer">
          <p>This invitation was sent by ${companyName}.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} Mocksy. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Send invitation email
export async function sendInvitationEmail({
  to,
  subject,
  testTitle,
  testRole,
  testDuration,
  invitationToken,
  testId,
  message,
  senderName,
  senderEmail,
  companyName,
  companyDescription,
  companyLogo,
  companyIndustry,
  jobTitle,
  deadline,
}) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const invitationLink = `${baseUrl}/test/${testId}?token=${invitationToken}`

    const transporter = getTransporter()

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"${companyName} via Mocksy" <mocksyapp@gmail.com>`,
      replyTo: senderEmail,
      to,
      subject: `${companyName}: ${subject}`,
      html: getInvitationEmailTemplate({
        testTitle,
        testRole,
        testDuration,
        invitationLink,
        message,
        senderName,
        companyName,
        companyDescription,
        jobTitle,
        deadline,
        companyLogo,
        companyIndustry,
      }),
    }

    // Use a mock email service in development if no email config is provided
    if (process.env.NODE_ENV === "development" && !process.env.EMAIL_PASSWORD) {
      console.log("Email would be sent in production:")
      console.log("To:", to)
      console.log("Subject:", mailOptions.subject)
      console.log("From:", mailOptions.from)
      console.log("Company:", companyName)
      console.log("Link:", invitationLink)
      return { sent: true, mock: true }
    }

    const info = await transporter.sendMail(mailOptions)
    return { sent: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { sent: false, error: error.message }
  }
}
