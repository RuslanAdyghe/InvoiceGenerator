import "dotenv/config";
import nodemailer from "nodemailer";
import { getUserById } from "./auth.js";
import { getInvoiceById } from "./invoice.js";
import toUBLXml from "./XmlConverter.js";

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASS;

  if (!user || !pass) {
    throw new Error(
      "Missing Gmail credentials. Set GMAIL_USER and GMAIL_APP_PASS in your .env file."
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}


async function sendEmail({ to, subject, body, attachment }) {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Invoice Generator" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text: body,
    ...(attachment && {
      attachments: [
        {
          filename: attachment.filename,
          content: attachment.content,
          contentType: attachment.contentType,
        },
      ],
    }),
  };

  const info = await transporter.sendMail(mailOptions);

  console.log(`[Email] Sent to ${to} — Message ID: ${info.messageId}`);
  return { success: true, to, messageId: info.messageId };
}

async function sendInvoiceEmail(invoiceId) {
  if (!invoiceId) {
    throw new Error("invoiceId is required");
  }

  const invoice = await getInvoiceById(invoiceId);

  const user = await getUserById(invoice.user_id);
  if (!user) {
    throw new Error(`No user found for user_id: ${invoice.user_id}`);
  }

  const customerEmail = user.email;
  if (!customerEmail) {
    throw new Error(`User ${invoice.user_id} has no email address`);
  }

  const xmlContent = toUBLXml(invoice.invoice_data);

  const customerName = invoice.invoice_data?.Customer?.Name ?? "Customer";
  const issueDate = invoice.invoice_data?.IssueDate ?? "N/A";
  const payable =
    invoice.invoice_data?.LegalMonetaryTotal?.PayableAmount ?? "N/A";
  const currency =
    invoice.invoice_data?.LegalMonetaryTotal?.Currency ?? "";

  const result = await sendEmail({
    to: customerEmail,
    subject: `Invoice ${invoiceId} from ${invoice.invoice_data?.Supplier?.Name ?? "Supplier"}`,
    body: [
      `Dear ${customerName},`,
      ``,
      `Please find attached your invoice (ID: ${invoiceId}).`,
      ``,
      `  Issue Date:  ${issueDate}`,
      `  Amount Due:  ${payable} ${currency}`,
      ``,
      `The invoice is attached as a UBL XML file.`,
      ``,
      `Regards,`,
      invoice.invoice_data?.Supplier?.Name ?? "Your Supplier",
    ].join("\n"),
    attachment: {
      filename: `invoice-${invoiceId}.xml`,
      content: xmlContent,
      contentType: "application/xml",
    },
  });

  return { ...result, invoiceId };
}

export { sendInvoiceEmail, sendEmail };