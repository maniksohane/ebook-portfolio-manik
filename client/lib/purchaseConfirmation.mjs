export function purchaseConfirmation(result) {
  if (result?.paymentVerified !== true || result.paymentStatus !== "captured" || !result.download?.url) return null;
  const emailAddress = typeof result.emailAddress === "string" ? result.emailAddress.trim() : "";
  const recipient = emailAddress || "your email address";
  const emailSent = result.emailSent === true;
  return {
    title: "Payment verified",
    description: "Your payment is complete. Your ebook is ready to download.",
    emailSent,
    emailTitle: emailSent ? "Email sent" : "Email not sent yet",
    emailDescription: emailSent
      ? `Your ebook download link and payment receipt have been sent to ${recipient}. Check your inbox and spam folder.`
      : `Your payment is verified, but we could not send the email to ${recipient}. Download your ebook now, or retry email delivery below. You will not be charged again.`,
  };
}
