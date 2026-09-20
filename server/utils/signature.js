const crypto=require('crypto');
function equal(a,b){if(!a||!b||a.length!==b.length)return false;return crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));}
function verifyPaymentSignature({orderId,paymentId,signature}){const expected=crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');return equal(expected,signature);}
function verifyWebhookSignature(body,signature){const expected=crypto.createHmac('sha256',process.env.RAZORPAY_WEBHOOK_SECRET).update(body).digest('hex');return equal(expected,signature);}
module.exports={verifyPaymentSignature,verifyWebhookSignature};
