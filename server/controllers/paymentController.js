const crypto = require("crypto");
const supabase = require("../config/supabase");
const razorpay = require("../services/razorpayService");
const { sendPurchaseEmail } = require("../services/emailService");
const { getPublicApiOrigin } = require("../services/publicApiOrigin");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9()\-\s]{7,20}$/;
const expirySeconds = () => Math.min(Math.max(Number(process.env.DOWNLOAD_EXPIRY_SECONDS || 86400), 300), 604800);
const downloadLimit = () => Math.min(Math.max(Number(process.env.DOWNLOAD_LIMIT || 3), 1), 10);

function hmacIsValid(value, signature, secret) {
  if (typeof secret !== "string" || !secret || /^YOUR_|^placeholder/i.test(secret) || typeof signature !== "string" || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = crypto.createHmac("sha256", secret).update(value).digest();
  return crypto.timingSafeEqual(expected, Buffer.from(signature, "hex"));
}
function signatureIsValid(orderId, paymentId, signature) {
  return typeof orderId === "string" && typeof paymentId === "string" && hmacIsValid(`${orderId}|${paymentId}`, signature, process.env.RAZORPAY_KEY_SECRET);
}
function webhookIsValid(raw, signature) { return hmacIsValid(raw, signature, process.env.RAZORPAY_WEBHOOK_SECRET); }
function paymentMatches(transaction, payment, paymentId) {
  return transaction.status !== "refunded" && payment.id === paymentId && payment.order_id === transaction.razorpay_order_id &&
    Number(payment.amount) === Number(transaction.amount_paise) && payment.currency === transaction.currency && payment.status === "captured" &&
    (!transaction.razorpay_payment_id || transaction.razorpay_payment_id === paymentId);
}

async function createRazorpayOrder(req, res, next) { try {
  const { ebookId, firstName, lastName, email, phone } = req.body || {};
  const first = String(firstName || "").trim(), last = String(lastName || "").trim(), customerEmail = String(email || "").trim().toLowerCase(), customerPhone = String(phone || "").trim();
  if (!ebookId || !first || !last || !emailPattern.test(customerEmail) || !phonePattern.test(customerPhone)) return res.status(400).json({ success: false, message: "First name, last name, valid email, and valid phone number are required." });
  // Validate the emailed download origin before creating any payable order.
  getPublicApiOrigin(process.env);
  const { data: ebook, error } = await supabase.from("ebooks").select("*").eq("id", ebookId).eq("is_published", true).single();
  if (error || !ebook) return res.status(404).json({ success: false, message: "E-book not found." });
  const amount = Math.round(Number(ebook.price) * 100); if (!Number.isInteger(amount) || amount <= 0) return res.status(400).json({ success: false, message: "Invalid e-book price." });
  // Do not create an order or accept payment for a missing private ebook file.
  const { data: availableFile, error: fileError } = await supabase.storage.from("ebook-files").createSignedUrl(ebook.file_path, 60);
  if (fileError || !availableFile?.signedUrl) return res.status(409).json({ success: false, message: "This ebook is temporarily unavailable for download. No payment has been started. Please contact the seller or try again later." });
  const order = await razorpay.orders.create({ amount, currency: ebook.currency || "INR", receipt: `ebook_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`.slice(0, 40), notes: { ebookId: ebook.id, firstName: first, lastName: last, customerEmail, customerPhone } });
  const { data: transaction, error: transactionError } = await supabase.from("transactions").insert({ ebook_id: ebook.id, customer_name: `${first} ${last}`, customer_first_name: first, customer_last_name: last, customer_phone: customerPhone, customer_email: customerEmail, razorpay_order_id: order.id, amount_paise: amount, currency: order.currency, status: "created" }).select().single();
  if (transactionError) throw transactionError;
  res.json({ success: true, keyId: process.env.RAZORPAY_KEY_ID, orderId: order.id, amount: order.amount, currency: order.currency, transactionId: transaction.id, ebook: { id: ebook.id, title: ebook.title } });
} catch (error) { next(error); } }

async function createDelivery(transaction, ebook) {
  const baseUrl = getPublicApiOrigin(process.env);
  const { data: file, error: fileError } = await supabase.storage.from("ebook-files").createSignedUrl(ebook.file_path, 60);
  if (fileError || !file?.signedUrl) throw Object.assign(new Error("Payment received, but the ebook file is temporarily unavailable. Contact the seller; do not pay again."), { status: 503 });
  const { data: existing, error: existingError } = await supabase.from("downloads").select("*").eq("transaction_id", transaction.id).maybeSingle();
  if (existingError) throw existingError;
  if (existing && (!Number.isFinite(new Date(existing.expires_at).getTime()) || new Date(existing.expires_at) <= new Date() || Number(existing.download_count) >= Number(existing.download_limit))) {
    throw Object.assign(new Error("Your purchase is paid, but this download link has expired or reached its limit. Contact the seller; do not pay again."), { status: 410 });
  }
  const expiresAt = existing?.expires_at || new Date(Date.now() + expirySeconds() * 1000).toISOString();
  let download = existing;
  if (!download) {
    const { data, error } = await supabase.from("downloads").insert({ transaction_id: transaction.id, ebook_id: ebook.id, user_id: transaction.user_id || null, expires_at: expiresAt, download_count: 0, download_limit: downloadLimit() }).select().single();
    if (error) throw error;
    download = data;
  }
  if (!download) throw new Error("Unable to create ebook delivery.");
  return { url: `${baseUrl}/api/payment/download/${download.id}`, expiresAt };
}
async function sendDelivery(transaction, ebook) {
  const download = await createDelivery(transaction, ebook);
  if (transaction.delivery_email_sent_at) return { emailSent: true, download };
  let emailSent = false;
  let deliveryError = null;
  try {
    await sendPurchaseEmail({ transaction, ebook, download });
    emailSent = true;
  } catch (error) {
    deliveryError = error.message;
    console.error("Purchase email failed:", error.code || "EMAIL_DELIVERY_FAILED");
  }
  try {
    const { error } = await supabase.from("transactions").update(emailSent
      ? { delivery_email_sent_at: new Date().toISOString(), delivery_email_error: null }
      : { delivery_email_error: deliveryError }).eq("id", transaction.id);
    if (error) console.error("Could not save email delivery status:", error.code || "DATABASE_ERROR");
  } catch {
    console.error("Could not save email delivery status.");
  }
  // An email or logging failure must not turn a captured payment into a failure.
  return { emailSent, download };
}
async function captureOrder({ orderId, paymentId, signature }) {
  if (!signatureIsValid(orderId, paymentId, signature)) throw Object.assign(new Error("Invalid Razorpay payment signature."), { status: 400 });
  const { data: transaction, error } = await supabase.from("transactions").select("*,ebooks(*)").eq("razorpay_order_id", orderId).single();
  if (error || !transaction?.ebooks) throw Object.assign(new Error("Transaction not found."), { status: 404 });
  const payment = await razorpay.payments.fetch(paymentId);
  if (!paymentMatches(transaction, payment, paymentId)) throw Object.assign(new Error("Payment is not captured or does not match this purchase."), { status: 409 });
  const { data: captured, error: updateError } = await supabase.from("transactions").update({ razorpay_payment_id: paymentId, razorpay_signature: signature, payment_method: payment.method || null, payment_date: new Date(Number(payment.created_at) * 1000).toISOString(), status: "captured", webhook_received: transaction.webhook_received || false }).eq("id", transaction.id).select("*,ebooks(*)").single();
  if (updateError) throw updateError;
  return { transaction: captured, ...(await sendDelivery(captured, captured.ebooks)) };
}

async function verifyRazorpayPayment(req, res, next) {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body || {};
    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: "Incomplete Razorpay payment details." });
    }
    const result = await captureOrder({ orderId: razorpayOrderId, paymentId: razorpayPaymentId, signature: razorpaySignature });
    res.json({
      success: true,
      paymentVerified: true,
      paymentStatus: "captured",
      message: "Payment verified successfully. Your ebook is ready to download.",
      emailSent: result.emailSent,
      emailAddress: result.transaction.customer_email,
      emailMessage: result.emailSent
        ? "Your ebook download link and payment receipt have been sent to your email address. Please check your inbox and spam folder."
        : "Your payment is complete, but the backup email could not be sent. Download your ebook here. You can retry email delivery without paying again.",
      transactionId: result.transaction.id,
      download: result.download,
    });
  } catch (error) { next(error); }
}
async function razorpayWebhook(req, res, next) {
  try {
    const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || "");
    if (!webhookIsValid(raw, req.headers["x-razorpay-signature"])) return res.status(400).json({ success: false, message: "Invalid webhook signature." });
    const event = JSON.parse(raw.toString("utf8"));
    const payment = event.payload?.payment?.entity;
    if (event.event === "payment.captured" && payment?.order_id && payment?.id) {
      const { data: transaction, error } = await supabase.from("transactions").select("*").eq("razorpay_order_id", payment.order_id).maybeSingle();
      if (error) throw error;
      if (transaction) {
        if (!paymentMatches(transaction, payment, payment.id)) return res.status(409).json({ success: false, message: "Webhook payment does not match this purchase." });
        const { error: updateError } = await supabase.from("transactions").update({ razorpay_payment_id: payment.id, payment_method: payment.method || null, payment_date: new Date(Number(payment.created_at) * 1000).toISOString(), status: "captured", webhook_received: true }).eq("id", transaction.id);
        if (updateError) throw updateError;
        const { data: captured, error: capturedError } = await supabase.from("transactions").select("*,ebooks(*)").eq("id", transaction.id).single();
        if (capturedError) throw capturedError;
        if (captured?.ebooks && !captured.delivery_email_sent_at) await sendDelivery(captured, captured.ebooks);
      }
    }
    res.json({ success: true });
  } catch (error) { next(error); }
}

async function downloadEbook(req, res, next) {
  try {
    const { data: download, error } = await supabase.from("downloads").select("*,ebooks(*)").eq("id", req.params.downloadId).single();
    if (error || !download?.ebooks) return res.status(404).send("Download link not found.");
    res.setHeader("Cache-Control", "no-store");
    const expires = new Date(download.expires_at).getTime();
    if (!Number.isFinite(expires) || expires <= Date.now()) return res.status(410).send("This download link has expired.");
    const { data: transaction, error: paymentError } = await supabase.from("transactions").select("status,ebook_id").eq("id", download.transaction_id).single();
    if (paymentError) throw paymentError;
    if (transaction?.status !== "captured" || transaction.ebook_id !== download.ebook_id) return res.status(403).send("This download requires a verified payment.");
    const used = Number(download.download_count);
    const limit = Number(download.download_limit);
    if (!Number.isInteger(used) || !Number.isInteger(limit) || used < 0 || limit < 1 || used >= limit) return res.status(403).send("Download limit reached.");
    const seconds = Math.min(300, Math.max(1, Math.floor((expires - Date.now()) / 1000)));
    const { data: signed, error: signedError } = await supabase.storage.from("ebook-files").createSignedUrl(download.ebooks.file_path, seconds, { download: true });
    if (signedError || !signed?.signedUrl) throw Object.assign(new Error("Unable to prepare the ebook file. Please try again or contact support."), { status: 502 });
    // Compare-and-set prevents two concurrent clicks consuming the same counter value.
    const { data: claimed, error: claimError } = await supabase.from("downloads").update({ download_count: used + 1 }).eq("id", download.id).eq("download_count", used).lt("download_count", limit).select().maybeSingle();
    if (claimError) throw claimError;
    if (!claimed) return res.status(409).send("Another download is being prepared. Please try again.");
    res.redirect(302, signed.signedUrl);
  } catch (error) { next(error); }
}
async function getPurchases(req, res, next) { try { const { data, error } = await supabase.from("transactions").select("*,ebooks(*)").eq("user_id", req.user.id).eq("status", "captured").order("created_at", { ascending: false }); if (error) throw error; res.json({ success: true, purchases: data || [] }); } catch (error) { next(error); } }
module.exports = { createRazorpayOrder, verifyRazorpayPayment, razorpayWebhook, downloadEbook, getPurchases };
