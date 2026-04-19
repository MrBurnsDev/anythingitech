import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, phone, town, project_type, message } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    // Send email via Resend
    const { error } = await resend.emails.send({
      from: "Anything Itech MV <contact@anythingitechmv.com>",
      to: "louis@anythingitechmv.com",
      replyTo: email,
      subject: `New Inquiry from ${name} - ${project_type || "General"}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Town:</strong> ${town || "Not provided"}</p>
        <p><strong>Project Type:</strong> ${project_type || "Not specified"}</p>
        <h3>Message:</h3>
        <p>${message || "No message provided"}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This message was sent from the Anything Itech MV website contact form.</p>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Town: ${town || "Not provided"}
Project Type: ${project_type || "Not specified"}

Message:
${message || "No message provided"}

---
This message was sent from the Anything Itech MV website contact form.
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: "Failed to send email" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
