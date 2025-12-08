import {onRequest} from "firebase-functions/v2/https";
import {initializeApp} from "firebase-admin/app";
import {setGlobalOptions} from "firebase-functions/v2";
import * as nodemailer from "nodemailer";
import cors from "cors";
import * as dotenv from "dotenv";
import axios from "axios";

// Load environment variables from .env file
dotenv.config();

// Initialize Firebase Admin
initializeApp();

// Set global options
setGlobalOptions({region: "us-central1"});

// CORS configuration
const corsHandler = cors({
  origin: [
    "https://workshopno5.web.app",
    "https://workshopno5.firebaseapp.com",
    "http://localhost:5000", // For local development
    "https://workshopno5.com" // For custom domain when set up
  ],
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
});

// Verify reCAPTCHA token
const verifyRecaptcha = async (token: string): Promise<boolean> => {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY || "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: secretKey,
          response: token
        }
      }
    );

    return response.data.success === true;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
};

// Email transporter configuration
const createTransporter = () => {
  // Using Gmail SMTP - you'll need to set up App Password
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "info@workshopno5.com",
      pass: process.env.EMAIL_PASSWORD || "your-app-password"
    }
  });
};

// Email template for contact form
const createEmailTemplate = (formData: any) => {
  const {
    yourName,
    phone,
    email,
    requestType,
    howdYouHear,
    description,
    whenToBegin,
    workedWithArchitect
  } = formData;

  return {
    subject: `New Contact Form Submission - ${requestType || 'General Inquiry'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d01a25; border-bottom: 2px solid #d01a25; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Contact Information</h3>
          <p><strong>Name:</strong> ${yourName || 'Not provided'}</p>
          <p><strong>Email:</strong> ${email || 'Not provided'}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        </div>
        
        <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Project Details</h3>
          <p><strong>Request Type:</strong> ${requestType || 'Not specified'}</p>
          <p><strong>How did you hear about us:</strong> ${howdYouHear || 'Not provided'}</p>
          <p><strong>When to begin:</strong> ${whenToBegin || 'Not provided'}</p>
          <p><strong>Worked with architect before:</strong> ${workedWithArchitect || 'Not provided'}</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Project Description</h3>
          <p style="white-space: pre-wrap;">${description || 'No description provided'}</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px;">
          <p>This email was sent from the Workshop No. 5 website contact form.</p>
          <p>Submitted at: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `,
    text: `
New Contact Form Submission

Contact Information:
Name: ${yourName || 'Not provided'}
Email: ${email || 'Not provided'}
Phone: ${phone || 'Not provided'}

Project Details:
Request Type: ${requestType || 'Not specified'}
How did you hear about us: ${howdYouHear || 'Not provided'}
When to begin: ${whenToBegin || 'Not provided'}
Worked with architect before: ${workedWithArchitect || 'Not provided'}

Project Description:
${description || 'No description provided'}

Submitted at: ${new Date().toLocaleString()}
    `
  };
};

// Auto-reply email template
const createAutoReplyTemplate = (clientName: string) => {
  return {
    subject: "Thank you for contacting Workshop No. 5",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #d01a25; margin-bottom: 10px;">Workshop No. 5</h1>
          <p style="color: #6c757d; font-size: 16px;">Austin Architecture and Interiors Firm</p>
        </div>
        
        <h2 style="color: #333;">Thank you for your inquiry, ${clientName}!</h2>
        
        <p>We've received your message and appreciate your interest in Workshop No. 5. Our team will review your project details and get back to you within 1-2 business days.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">What happens next?</h3>
          <ol>
            <li>Our team will review your project requirements</li>
            <li>We'll schedule a consultation to discuss your vision</li>
            <li>We'll provide you with a customized proposal</li>
          </ol>
        </div>
        
        <p>In the meantime, feel free to explore our portfolio at <a href="https://workshopno5.web.app" style="color: #d01a25;">workshopno5.web.app</a></p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p style="margin-bottom: 5px;"><strong>Workshop No. 5</strong></p>
          <p style="margin-bottom: 5px; color: #6c757d;">Austin, Texas</p>
          <p style="color: #6c757d;">Email: info@workshopno5.com</p>
        </div>
      </div>
    `,
    text: `
Thank you for your inquiry, ${clientName}!

We've received your message and appreciate your interest in Workshop No. 5. Our team will review your project details and get back to you within 1-2 business days.

What happens next?
1. Our team will review your project requirements
2. We'll schedule a consultation to discuss your vision  
3. We'll provide you with a customized proposal

In the meantime, feel free to explore our portfolio at workshopno5.web.app

Workshop No. 5
Austin, Texas
Email: info@workshopno5.com
    `
  };
};

// Main sendEmail Cloud Function
export const sendEmail = onRequest({
  region: "us-central1",
  memory: "256MiB",
  timeoutSeconds: 60,
  invoker: "public" // Allow unauthenticated invocations
}, async (request, response) => {
  // Manually handle CORS headers
  const origin = request.headers.origin as string;
  const allowedOrigins = [
    "https://workshopno5.web.app",
    "https://workshopno5.firebaseapp.com",
    "http://localhost:5000",
    "https://workshopno5.com"
  ];

  if (allowedOrigins.includes(origin)) {
    response.set("Access-Control-Allow-Origin", origin);
    response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.set("Access-Control-Allow-Credentials", "true");
  }

  // Handle OPTIONS preflight request
  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }

  // Handle CORS
  return new Promise<void>((resolve) => {
    corsHandler(request, response, async () => {
      try {

        // Only allow POST requests for actual submissions
        if (request.method !== "POST") {
          response.status(405).json({
            success: false,
            error: "Method not allowed"
          });
          resolve();
          return;
        }

        // Verify secret key to ensure request is from our app only
        const authHeader = request.headers.authorization;
        const expectedKey = process.env.FUNCTION_SECRET_KEY;

        if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
          response.status(403).json({
            success: false,
            error: "Unauthorized access"
          });
          resolve();
          return;
        }

        // Extract form data
        const formData = request.body;

        // Basic validation
        if (!formData.email || !formData.yourName) {
          response.status(400).json({
            success: false,
            error: "Name and email are required"
          });
          resolve();
          return;
        }

        // Verify reCAPTCHA token
        if (!formData.recaptchaToken) {
          console.log("reCAPTCHA token missing");
          response.status(403).json({
            success: false,
            error: "reCAPTCHA verification required"
          });
          resolve();
          return;
        }

        const recaptchaValid = await verifyRecaptcha(formData.recaptchaToken);
        if (!recaptchaValid) {
          console.log("reCAPTCHA verification failed");
          response.status(403).json({
            success: false,
            error: "reCAPTCHA verification failed"
          });
          resolve();
          return;
        }

        // Time on page validation (should be at least 3 seconds)
        if (formData.timeOnPage && formData.timeOnPage < 3000) {
          console.log("Bot detected: form submitted too quickly", formData.timeOnPage);
          response.status(403).json({
            success: false,
            error: "Form submitted too quickly"
          });
          resolve();
          return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          response.status(400).json({
            success: false,
            error: "Please provide a valid email address"
          });
          resolve();
          return;
        }

        // Create transporter
        const transporter = createTransporter();

        // Create email templates
        const adminEmail = createEmailTemplate(formData);
        const autoReply = createAutoReplyTemplate(formData.yourName);

        // Send email to admin/business owner
        await transporter.sendMail({
          from: `"Workshop No. 5 Contact Form" <${process.env.EMAIL_USER || 'info@workshopno5.com'}>`,
          to: 'bryon.bowers@gmail.com, vani@workshopno5.com', // Where to receive inquiries
          subject: adminEmail.subject,
          html: adminEmail.html,
          text: adminEmail.text,
          replyTo: formData.email
        });

        // Send auto-reply to client
        await transporter.sendMail({
          from: `"Workshop No. 5" <${process.env.EMAIL_USER || 'info@workshopno5.com'}>`,
          to: formData.email,
          subject: autoReply.subject,
          html: autoReply.html,
          text: autoReply.text
        });

        // Success response
        response.status(200).json({
          success: true,
          message: "Your message has been sent successfully! We'll get back to you soon.",
          statusCode: 200
        });

        console.log(`Email sent successfully for: ${formData.yourName} (${formData.email})`);
        resolve();

      } catch (error) {
        console.error("Error sending email:", error);
        response.status(500).json({
          success: false,
          error: "Failed to send email. Please try again later."
        });
        resolve();
      }
    });
  });
});

// Health check function
export const healthCheck = onRequest({
  cors: true,
  region: "us-central1"
}, (request, response) => {
  response.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Workshop No. 5 Email Service"
  });
});