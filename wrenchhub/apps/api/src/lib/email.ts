import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || "The Wrench Hub <noreply@thewrenchhub.com>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.log(`[Email] Would send to ${to}: ${subject}`);
    console.log(`[Email] No RESEND_API_KEY configured, skipping`);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${subject}`);
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error);
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendEmail({
    to,
    subject: "Reset your password — The Wrench Hub",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #0f0f23;">The <span style="color: #ff6b35;">Wrench</span> <span style="color: #4ecdc4;">Hub</span></h2>
        <p>We received a request to reset your password.</p>
        <p>Click the button below to set a new password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #ff6b35; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">Reset Password</a>
        <p style="color: #888; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 12px;">The Wrench Hub — The smarter way to get your car fixed.</p>
      </div>
    `,
  });
}

export async function sendBidNotificationEmail(
  to: string,
  jobTitle: string,
  mechanicName: string,
  bidAmount: number
) {
  await sendEmail({
    to,
    subject: `New bid on "${jobTitle}" — The Wrench Hub`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #0f0f23;">The <span style="color: #ff6b35;">Wrench</span> <span style="color: #4ecdc4;">Hub</span></h2>
        <p>Great news! <strong>${mechanicName}</strong> just submitted a bid on your job:</p>
        <div style="background: #f8f9fb; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; font-weight: bold;">${jobTitle}</p>
          <p style="margin: 8px 0 0; font-size: 24px; font-weight: bold; color: #0f0f23;">$${bidAmount.toFixed(0)}</p>
        </div>
        <a href="${process.env.FRONTEND_URL || "https://thewrenchhub.com"}/dashboard" style="display: inline-block; background: #ff6b35; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">View Bids</a>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 12px;">The Wrench Hub — The smarter way to get your car fixed.</p>
      </div>
    `,
  });
}

export async function sendBidAcceptedEmail(
  to: string,
  jobTitle: string,
  ownerName: string
) {
  await sendEmail({
    to,
    subject: `Your bid was accepted! — The Wrench Hub`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #0f0f23;">The <span style="color: #ff6b35;">Wrench</span> <span style="color: #4ecdc4;">Hub</span></h2>
        <p>Congratulations! <strong>${ownerName}</strong> accepted your bid on:</p>
        <div style="background: #e8f5e9; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; font-weight: bold; color: #2e7d32;">${jobTitle}</p>
        </div>
        <p>Message the car owner to schedule the work.</p>
        <a href="${process.env.FRONTEND_URL || "https://thewrenchhub.com"}/mechanic/bids" style="display: inline-block; background: #4ecdc4; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">View My Bids</a>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 12px;">The Wrench Hub — The smarter way to get your car fixed.</p>
      </div>
    `,
  });
}
