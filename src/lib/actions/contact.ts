"use server";

import { Resend } from "resend";

const SUPPORT_EMAIL = "bubbavansmack29@gmail.com";

export async function submitContact(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !category || !message) {
    return { ok: false, error: "Please fill in all fields." };
  }
  if (message.length > 2000) {
    return { ok: false, error: "Message must be under 2000 characters." };
  }

  if (!process.env.RESEND_API_KEY) {
    // Dev fallback — log to console if no key set
    console.log("[Contact form]", { name, email, category, message });
    return { ok: true };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const categoryLabels: Record<string, string> = {
    general: "General Question",
    billing: "Billing & Subscription",
    bug: "Bug Report",
    spot: "Spot / Map Issue",
    account: "Account Help",
    other: "Other",
  };

  const { error } = await resend.emails.send({
    from: "HookLine Support <onboarding@resend.dev>",
    to: SUPPORT_EMAIL,
    replyTo: email,
    subject: `[HookLine Support] ${categoryLabels[category] ?? category} — ${name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: #0c1a2e; border-radius: 12px; padding: 24px; color: #e2e8f0;">
          <h2 style="color: #60a5fa; margin: 0 0 16px;">New HookLine Support Message</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: #64748b; padding: 6px 0; width: 100px; vertical-align: top;">Name</td>
              <td style="color: #e2e8f0; padding: 6px 0;">${name}</td>
            </tr>
            <tr>
              <td style="color: #64748b; padding: 6px 0; vertical-align: top;">Email</td>
              <td style="padding: 6px 0;"><a href="mailto:${email}" style="color: #60a5fa;">${email}</a></td>
            </tr>
            <tr>
              <td style="color: #64748b; padding: 6px 0; vertical-align: top;">Category</td>
              <td style="color: #e2e8f0; padding: 6px 0;">${categoryLabels[category] ?? category}</td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #1e3a5f; margin: 16px 0;" />
          <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px;">Message:</p>
          <p style="color: #e2e8f0; white-space: pre-wrap; margin: 0;">${message}</p>
        </div>
        <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 16px;">
          Reply directly to this email to respond to ${name}.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return { ok: false, error: "Failed to send message. Please try again." };
  }

  return { ok: true };
}
