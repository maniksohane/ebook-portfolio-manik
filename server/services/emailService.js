function escapeHtml(value = "") { return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char])); }

async function sendPurchaseEmail({ transaction, ebook, download }) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return { skipped: true };
  const firstName = escapeHtml(transaction.customer_first_name || transaction.customer_name || "there");
  const title = escapeHtml(ebook.title);
  const amount = `${transaction.currency || "INR"} ${(Number(transaction.amount_paise) / 100).toFixed(2)}`;
  const expiry = new Date(download.expiresAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  const html = `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#172033"><h1 style="color:#2563eb">Your ebook is ready, ${firstName}.</h1><p>Thank you for purchasing <strong>${title}</strong>.</p><p><a href="${download.url}" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 22px;border-radius:8px;text-decoration:none;font-weight:700">Download your ebook</a></p><p style="color:#667085">This private link expires ${escapeHtml(expiry)} and allows a limited number of downloads.</p><hr style="border:0;border-top:1px solid #e4e7ec"><p><strong>Payment confirmation</strong><br>Book: ${title}<br>Amount paid: ${escapeHtml(amount)}<br>Order ID: ${escapeHtml(transaction.razorpay_order_id)}</p><p style="color:#667085">Questions? Reply to this email.</p></div>`;
  const payload = { from: process.env.EMAIL_FROM, to: [transaction.customer_email], subject: `Your ebook: ${ebook.title}`, html };
  if (process.env.OWNER_NOTIFICATION_EMAIL) payload.bcc = [process.env.OWNER_NOTIFICATION_EMAIL];
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(`Email delivery failed (${response.status}): ${await response.text()}`);
  return response.json();
}

module.exports = { sendPurchaseEmail };
