import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      business_name,
      town,
      category,
      address,
      description,
      phone,
      email,
      website,
      contact_name,
      contact_email,
      notes,
      confirms_ownership,
    } = req.body;

    // Validate required fields
    if (!business_name || !town || !category || !contact_name || !contact_email) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    // Send email notification via Resend
    const { error } = await resend.emails.send({
      from: "Martha's Vineyard IT <directory@anythingitechmv.com>",
      to: "louis@anythingitechmv.com",
      replyTo: contact_email,
      subject: `Directory Submission: ${business_name} (${town})`,
      html: `
        <h2>New Directory Submission</h2>
        <p>A new business has been submitted for review.</p>

        <h3>Business Information</h3>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 150px;">Business Name</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${business_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Town</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${town}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Category</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${category}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Address</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${address || "Not provided"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Phone</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${phone || "Not provided"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${email || "Not provided"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Website</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${website || "Not provided"}</td>
          </tr>
        </table>

        <h3>Description</h3>
        <p style="background: #f5f5f5; padding: 12px; border-radius: 4px;">${description || "No description provided"}</p>

        <h3>Submitter Information</h3>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 150px;">Contact Name</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${contact_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Contact Email</td>
            <td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${contact_email}">${contact_email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Confirms Ownership</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${confirms_ownership === "yes" ? "Yes" : "No"}</td>
          </tr>
        </table>

        ${notes ? `
        <h3>Additional Notes</h3>
        <p style="background: #f5f5f5; padding: 12px; border-radius: 4px;">${notes}</p>
        ` : ""}

        <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
          This submission was received from the Martha's Vineyard IT business directory.<br>
          To add this business to the database, manually insert it into <code>data/mv_registry.db</code>
          and run <code>npm run export-directory</code>.
        </p>
      `,
      text: `
New Directory Submission

Business Information:
- Business Name: ${business_name}
- Town: ${town}
- Category: ${category}
- Address: ${address || "Not provided"}
- Phone: ${phone || "Not provided"}
- Email: ${email || "Not provided"}
- Website: ${website || "Not provided"}

Description:
${description || "No description provided"}

Submitter Information:
- Contact Name: ${contact_name}
- Contact Email: ${contact_email}
- Confirms Ownership: ${confirms_ownership === "yes" ? "Yes" : "No"}

${notes ? `Additional Notes:\n${notes}` : ""}

---
This submission was received from the Martha's Vineyard IT business directory.
To add this business to the database, manually insert it into data/mv_registry.db
and run npm run export-directory.
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: "Failed to send submission" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
