import nodemailer from "nodemailer";
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

interface RestOptions {
  [key: string]: any;
}

const SendMail = async (
  sendTo: string,
  subject: string,
  fileName: string,
  rest: RestOptions,
  attachmentBase64String? : any,
  cc? : any[]
) => {
  try {
    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com", // SMTP server hostname
      port: 587, // SMTP server port
      secure: false, // Use TLS
      auth: {
        user: process.env.WELCOME_REGISTER_EMAIL_USERNAME,
        pass: process.env.WELCOME_REGISTER_EMAIL_PASSWORD,
      },
    });

    // Path to the email template
    const templatePath = path.join(__dirname, 'templates', fileName);
    // Read the template file
    const template = fs.readFileSync(templatePath, 'utf8');

    // Default placeholders
    let personalizedTemplate = template
      .replace('{{buttonText}}', 'Click Here')
      .replace('{{year}}', new Date().getFullYear().toString())
      .replace('{{companyName}}', process.env.COMPANY_NAME || '');

    // Dynamically replace placeholders with values from the `rest` object
    for (const [key, value] of Object.entries(rest)) {
      const placeholder = `{{${key}}}`;
      personalizedTemplate = personalizedTemplate.replace(new RegExp(placeholder, 'g'), String(value));
    }

    // Ensure the logoUrl is replaced if provided in the `rest` object, fallback to process.env.WEB_LOGO if missing
    if (!rest.logoUrl) {
      personalizedTemplate = personalizedTemplate.replace('{{logoUrl}}', process.env.WEB_LOGO || "https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg");
    }

    // Message options
    const messageTemplate: any = {
      from: process.env.WELCOME_REGISTER_EMAIL_USERNAME,
      to: sendTo,
      subject: subject,
      html: personalizedTemplate,
    };

    if (cc) {
      messageTemplate.cc = cc;
    }

    if (attachmentBase64String) {
      const base64Content = attachmentBase64String.split(';base64,').pop();
      const fileBuffer = Buffer.from(base64Content, 'base64');

      messageTemplate.attachments = [
        {
          filename: 'attachment.xlsx',
          content: fileBuffer,
          encoding: 'base64',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      ];
    }

    // Send the email
    await transporter.sendMail(messageTemplate);

    // Return success response
    return { success: true };

  } catch (error) {
    // Log the error and return failure response
    console.error('Error sending email:', error);
    return { success: false };
  }
};


export default SendMail;
