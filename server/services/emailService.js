const nodemailer = require("nodemailer");
const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

function emailError(code, message) {
  return Object.assign(new Error(message), { code });
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  }[char]));
}

function getEmailConfig() {
  const user = String(process.env.SMTP_USER || "").trim().toLowerCase();
  // Google displays app passwords in groups separated by spaces.
  const pass = String(process.env.SMTP_APP_PASSWORD || "").replace(/\s/g, "");
  if (!emailPattern.test(user) || !pass || /^YOUR_|^placeholder$|^changeme$/i.test(pass)) {
    throw emailError("EMAIL_NOT_CONFIGURED", "Set SMTP_USER and SMTP_APP_PASSWORD in server/.env. Use a Google App Password, not your Gmail login password.");
  }
  if (pass.length !== 16) {
    throw emailError("EMAIL_NOT_CONFIGURED", "SMTP_APP_PASSWORD must be the 16-character Google App Password (spaces are ignored).");
  }
  const from = String(process.env.EMAIL_FROM || `Manikya Publishing <${user}>`).trim();
  const fromAddress = (from.match(/<([^<>]+)>$/)?.[1] || from).trim().toLowerCase();
  if (/[\r\n]/.test(from) || fromAddress !== user) {
    throw emailError("EMAIL_NOT_CONFIGURED", "EMAIL_FROM must use the same email address as SMTP_USER.");
  }
  const bcc = String(process.env.OWNER_NOTIFICATION_EMAIL || "").trim();
  if (bcc && !emailPattern.test(bcc)) {
    throw emailError("EMAIL_NOT_CONFIGURED", "OWNER_NOTIFICATION_EMAIL must be a single email address or empty.");
  }
  return { user, pass, from, bcc };
}

function createTransport(config) {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: config.user, pass: config.pass },
    dnsTimeout: 5000,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    disableFileAccess: true,
    disableUrlAccess: true,
    logger: false,
    debug: false,
  });
}

function smtpError(error) {
  // Do not store SMTP responses containing recipient details or credentials.
  if (error.code === "EAUTH") {
    return emailError("EMAIL_AUTH_FAILED", "Gmail authentication failed. Check the App Password and that 2-Step Verification is enabled for SMTP_USER.");
  }
  if (["ETIMEDOUT", "ECONNECTION", "ESOCKET", "EDNS"].includes(error.code)) {
    return emailError("EMAIL_UNAVAILABLE", "Could not connect to Gmail SMTP. Check network access to smtp.gmail.com:465 and retry.");
  }
  return emailError("EMAIL_DELIVERY_FAILED", "Gmail did not accept the purchase email. Check the sender account and recipient before retrying.");
}

async function sendPurchaseEmail({ transaction, ebook, download }) {
  const config = getEmailConfig();
  const recipient = String(transaction.customer_email || "").trim().toLowerCase();
  if (!emailPattern.test(recipient)) throw emailError("EMAIL_DELIVERY_FAILED", "The purchase email address is invalid.");
  const url = new URL(download.url);
  if (!["http:", "https:"].includes(url.protocol)) throw emailError("EMAIL_DELIVERY_FAILED", "The download link must use HTTP or HTTPS.");
  const expiryDate = new Date(download.expiresAt);
  if (!Number.isFinite(expiryDate.getTime()) || expiryDate <= new Date()) {
    throw emailError("EMAIL_DELIVERY_FAILED", "The download link has expired. Generate a new link before resending.");
  }
  const firstName = escapeHtml(transaction.customer_first_name || transaction.customer_name || "there");
  const title = escapeHtml(ebook.title);
  const amount = `${transaction.currency || "INR"} ${(Number(transaction.amount_paise) / 100).toFixed(2)}`;
  const expiry = `${expiryDate.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })} IST`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#172033"><h1 style="color:#2563eb">Your ebook is ready, ${firstName}.</h1><p>Thank you for purchasing <strong>${title}</strong>.</p><p><a href="${escapeHtml(url.href)}" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 22px;border-radius:8px;text-decoration:none;font-weight:700">Download your ebook</a></p><p style="color:#667085">This private link expires ${escapeHtml(expiry)} and allows a limited number of downloads.</p><hr style="border:0;border-top:1px solid #e4e7ec"><p><strong>Payment receipt</strong><br>Book: ${title}<br>Amount paid: ${escapeHtml(amount)}<br>Order ID: ${escapeHtml(transaction.razorpay_order_id)}</p><p style="color:#667085">Questions? Reply to this email.</p></div>`;
  const text = `Your ebook is ready.\n\nThank you for purchasing ${ebook.title}.\nDownload: ${url.href}\nLink expires: ${expiry}. Limited downloads apply.\n\nPayment receipt\nAmount paid: ${amount}\nOrder ID: ${transaction.razorpay_order_id}\n\nQuestions? Reply to this email.`;
  const transport = createTransport(config);
  try {
    const info = await transport.sendMail({
      from: config.from,
      replyTo: config.user,
      to: recipient,
      ...(config.bcc ? { bcc: config.bcc } : {}),
      subject: `Your ebook: ${String(ebook.title).replace(/[\r\n]/g, " ")}`,
      text,
      html,
    });
    // A BCC acceptance alone must not mark the customer's email as sent.
    if (!info.accepted?.some((address) => String(address).toLowerCase() === recipient)) {
      throw emailError("EMAIL_DELIVERY_FAILED", "The customer email was not accepted.");
    }
    return { id: info.messageId, provider: "gmail" };
  } catch (error) {
    throw smtpError(error);
  } finally {
    transport.close();
  }
}

async function verifyEmailConnection() {
  const config = getEmailConfig();
  const transport = createTransport(config);
  try {
    await transport.verify();
    return { provider: "gmail", sender: config.user };
  } catch (error) {
    throw smtpError(error);
  } finally {
    transport.close();
  }
}

module.exports = { sendPurchaseEmail, verifyEmailConnection };
