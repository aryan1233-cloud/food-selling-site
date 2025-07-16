import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendResetEmail(to, token) {
  const resetUrl = `${process.env.BASE_URL}/auth/reset/${token}`;
  await transporter.sendMail({
    to,
    from: `Foodies <${process.env.EMAIL_USER}>`,
    subject: "Password Reset",
    html: `<p>Forgot your password? <a href="${resetUrl}">Click here</a> to reset. This link is valid for 15 minutes.</p>`
  });
}
