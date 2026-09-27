"use client";

import { useEffect, useRef, useState } from "react";
import { createRazorpayOrder } from "../lib/api";
import { checkStoreService } from "../lib/apiTransport.mjs";
import { checkoutAction, verifyPaymentDetails } from "../lib/paymentVerification.mjs";
import { buildRazorpayCheckoutOptions, getRazorpayMode } from "../lib/razorpayCheckoutOptions.mjs";
import { fetchPaymentMethods } from "../lib/paymentMethods.mjs";
import { purchaseConfirmation } from "../lib/purchaseConfirmation.mjs";
import { CircleCheck, Download, MailCheck, MailWarning } from "lucide-react";

const RAZORPAY_SCRIPT =
  "https://checkout.razorpay.com/v1/checkout.js";
let scriptLoading;

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptLoading) return scriptLoading;
  scriptLoading = new Promise((resolve) => {
    const script = document.createElement("script");
    const finish = (loaded) => {
      clearTimeout(timer);
      script.onload = null;
      script.onerror = null;
      if (!loaded) script.remove();
      resolve(loaded);
    };
    const timer = setTimeout(() => finish(false), 15000);
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => finish(Boolean(window.Razorpay));
    script.onerror = () => finish(false);
    document.body.appendChild(script);
  }).finally(() => { scriptLoading = null; });
  return scriptLoading;
}

export default function RazorpayCheckout({ ebook }) {
  const [showBuyerForm, setShowBuyerForm] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentPreference, setPaymentPreference] = useState("other");
  const [paymentMode, setPaymentMode] = useState(() => getRazorpayMode(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID));
  const [availability, setAvailability] = useState(null);
  const [methodsStatus, setMethodsStatus] = useState("loading");
  const [serviceStatus, setServiceStatus] = useState("loading");
  const [serviceAttempt, setServiceAttempt] = useState(0);
  const supportsUpi = (ebook.currency || "INR") === "INR";
  const upiAvailable = supportsUpi && methodsStatus === "ready" && availability?.upi === true;

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [download, setDownload] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [messageType, setMessageType] = useState("error");
  const [paymentDetails, setPaymentDetails] = useState(null);
  const paymentRef = useRef(null);
  const verificationInFlight = useRef(false);
  const checkoutInProgress = useRef(false);
  const action = checkoutAction({ paymentDetails, download, emailSent });

  useEffect(() => {
    if (!showBuyerForm || paymentDetails || download) return;
    let active = true;
    const controller = new AbortController();
    setServiceStatus("loading");
    setMethodsStatus("loading");
    setAvailability(null);
    setPaymentPreference("other");
    checkStoreService({ signal: controller.signal }).then(async () => {
      if (!active) return;
      setServiceStatus("ready");
      try {
        const result = await fetchPaymentMethods({ signal: controller.signal });
        if (!active) return;
        setAvailability(result);
        setPaymentMode(result.mode);
        setMethodsStatus("ready");
      } catch {
        if (active) setMethodsStatus("unavailable");
      }
    }).catch(() => {
      if (!active) return;
      setServiceStatus("unavailable");
      setMethodsStatus("unavailable");
    });
    return () => { active = false; controller.abort(); };
  }, [showBuyerForm, paymentDetails, download, serviceAttempt]);

  async function confirmExistingPayment(details) {
    if (verificationInFlight.current) return;
    verificationInFlight.current = true;
    setBusy(true);
    setMessageType("info");
    setMessage("Confirming your purchase and checking email delivery...");
    try {
      const data = await verifyPaymentDetails(details);
      setDownload(data.download);
      setEmailSent(data.emailSent === true);
      setConfirmation(purchaseConfirmation(data));
      setMessageType("success");
      setMessage("");
    } catch (error) {
      setMessageType("warning");
      setMessage(error?.message?.includes("do not pay again") ? error.message : "We could not finish checking your purchase. Retry the confirmation below; do not pay again. If this continues, contact support.");
    } finally {
      verificationInFlight.current = false;
      setBusy(false);
    }
  }

  function openBuyerForm() {
    if (!paymentRef.current && !download) setMessage("");
    setShowBuyerForm(true);
  }

  function closeBuyerForm() {
    if (busy) return;

    setShowBuyerForm(false);
  }

  async function continueToPayment(event) {
    event.preventDefault();
    if (busy || checkoutInProgress.current || action === "done") return;
    if (paymentRef.current) {
      if (action !== "done") await confirmExistingPayment(paymentRef.current);
      return;
    }
    if (serviceStatus !== "ready") return;
    setMessageType("error");
    setMessage("");

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (!trimmedFirstName) {
      setMessage("Please enter your first name.");
      return;
    }

    if (!trimmedLastName) {
      setMessage("Please enter your last name.");
      return;
    }

    if (!trimmedEmail) {
      setMessage("Please enter your email address.");
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (!/^\+?[0-9()\-\s]{7,20}$/.test(trimmedPhone)) {
      setMessage("Please enter a valid phone number.");
      return;
    }

    setBusy(true);
    checkoutInProgress.current = true;

    try {
      const loaded = await loadRazorpayScript();

      if (!loaded) {
        throw new Error(
          "Unable to load Razorpay Checkout. Please try again."
        );
      }

      const response = await createRazorpayOrder({
        ebookId: ebook.id,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        phone: trimmedPhone,
      });

      if (!response?.orderId) {
        throw new Error(
          "Razorpay order could not be created."
        );
      }

      const options = {
        ...buildRazorpayCheckoutOptions({
          order: response,
          title: ebook.title,
          buyer: { firstName: trimmedFirstName, lastName: trimmedLastName, email: trimmedEmail, phone: trimmedPhone },
          preference: paymentPreference,
          availability,
        }),

        handler: async function (paymentResponse) {
          const details = {
            razorpayPaymentId: paymentResponse.razorpay_payment_id,
            razorpayOrderId: paymentResponse.razorpay_order_id,
            razorpaySignature: paymentResponse.razorpay_signature,
          };
          paymentRef.current = details;
          setPaymentDetails(details);
          checkoutInProgress.current = false;
          await confirmExistingPayment(details);
        },

        modal: {
          ondismiss: function () {
            checkoutInProgress.current = false;
            if (!paymentRef.current) {
              setBusy(false);
              setMessage("");
            }
          },
        },

      };
      setPaymentMode(getRazorpayMode(response.keyId));

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function () {
          if (paymentRef.current) return;
          setBusy(false);
          setMessageType("error");
          setMessage(
            "Payment failed. Please try again."
          );
        }
      );

      razorpay.open();
    } catch (error) {
      checkoutInProgress.current = false;
      setBusy(false);

      setMessage(
        error?.message ||
          "Unable to start secure checkout. Please try again."
      );
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openBuyerForm}
        className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
      >
        {paymentDetails || download ? "View Purchase" : "Buy Now"}
      </button>

      {showBuyerForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby={`checkout-title-${ebook.id}`} className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-[#111214] shadow-2xl">
            <button
              type="button"
              onClick={closeBuyerForm}
              disabled={busy}
              className="absolute right-5 top-5 text-xl text-white/40 transition hover:text-white disabled:opacity-30"
              aria-label="Close"
            >
              ×
            </button>

            <div className="p-7">
              <div className="mb-7">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
                  Secure Checkout
                </p>

                <h2 id={`checkout-title-${ebook.id}`} className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  {confirmation ? "Payment Verified" : paymentDetails ? "Confirming Your Payment" : "Complete Your Purchase"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/50">
                  {confirmation ? "Your ebook is ready. No further payment is required." : paymentDetails ? "We are checking your payment with Razorpay. Please do not pay again." : "Enter your details before continuing to secure payment."}
                </p>
              </div>

              <form onSubmit={continueToPayment}>
                {!paymentDetails && !download && serviceStatus !== "ready" && (
                  <div role="status" className="mb-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-200">
                    {serviceStatus === "loading" ? "Connecting to secure checkout..." : <>
                      <p>Checkout is temporarily unavailable. No payment has been started. Please try again later.</p>
                      <button type="button" onClick={() => setServiceAttempt((value) => value + 1)} className="mt-3 font-semibold underline">Retry connection</button>
                    </>}
                  </div>
                )}
                {!paymentDetails && !download && serviceStatus === "ready" && paymentMode === "test" && (
                  <p role="status" className="mb-5 rounded-xl border border-blue-400/20 bg-blue-400/5 p-4 text-sm text-blue-200">Test checkout: no real money is charged. This store is not yet accepting live payments.</p>
                )}
                <fieldset disabled={busy || Boolean(paymentDetails || download)} className={confirmation ? "hidden" : "min-w-0"}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`firstName-${ebook.id}`}
                      className="mb-2 block text-sm text-white/70"
                    >
                      First Name
                    </label>

                    <input
                      id={`firstName-${ebook.id}`}
                      type="text"
                      value={firstName}
                      onChange={(event) =>
                        setFirstName(
                          event.target.value
                        )
                      }
                      placeholder="First name"
                      autoComplete="given-name"
                      disabled={busy}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/30 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`lastName-${ebook.id}`}
                      className="mb-2 block text-sm text-white/70"
                    >
                      Last Name
                    </label>

                    <input
                      id={`lastName-${ebook.id}`}
                      type="text"
                      value={lastName}
                      onChange={(event) =>
                        setLastName(
                          event.target.value
                        )
                      }
                      placeholder="Last name"
                      autoComplete="family-name"
                      disabled={busy}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/30 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor={`email-${ebook.id}`}
                    className="mb-2 block text-sm text-white/70"
                  >
                    Email Address
                  </label>

                  <input
                    id={`email-${ebook.id}`}
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={busy}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/30 disabled:opacity-50"
                  />

                <div className="mt-4">
                  <label htmlFor={`phone-${ebook.id}`} className="mb-2 block text-sm text-white/70">Phone Number</label>
                  <input id={`phone-${ebook.id}`} type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" autoComplete="tel" disabled={busy} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/30 disabled:opacity-50" />
                </div>

                  <p className="mt-2 text-xs leading-5 text-white/35">
                    Your e-book delivery and secure download
                    link will be sent to this email.
                  </p>
                </div>

                {supportsUpi && serviceStatus === "ready" && !paymentDetails && !download && (
                  <fieldset disabled={busy} aria-describedby={`payment-help-${ebook.id}`} className="mt-5 min-w-0">
                    <legend className="mb-2 text-sm font-medium text-white/80">Payment method</legend>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <label className={`flex items-start gap-3 rounded-xl border p-3 ${upiAvailable ? "cursor-pointer" : "cursor-not-allowed opacity-50"} ${paymentPreference === "upi" ? "border-blue-400/60 bg-blue-400/10" : "border-white/10 bg-white/[0.03]"}`}>
                        <input type="radio" name={`payment-method-${ebook.id}`} value="upi" disabled={!upiAvailable} checked={upiAvailable && paymentPreference === "upi"} onChange={() => setPaymentPreference("upi")} className="mt-1 accent-blue-500" />
                        <span>
                          <span className="block text-sm font-medium text-white">{paymentMode === "test" ? "UPI (test)" : "UPI / QR code"}</span>
                          <span className="mt-1 block text-xs leading-5 text-white/50">{methodsStatus === "loading" ? "Checking availability..." : !upiAvailable ? "Currently unavailable" : paymentMode === "test" ? "Simulated UPI payment" : "UPI apps or scan in Razorpay"}</span>
                        </span>
                      </label>
                      <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${paymentPreference === "other" ? "border-blue-400/60 bg-blue-400/10" : "border-white/10 bg-white/[0.03]"}`}>
                        <input type="radio" name={`payment-method-${ebook.id}`} value="other" checked={paymentPreference === "other"} onChange={() => setPaymentPreference("other")} className="mt-1 accent-blue-500" />
                        <span>
                          <span className="block text-sm font-medium text-white">Available methods</span>
                          <span className="mt-1 block text-xs leading-5 text-white/50">Choose inside Razorpay</span>
                        </span>
                      </label>
                    </div>
                    <p id={`payment-help-${ebook.id}`} role="status" className="mt-2 text-xs leading-5 text-white/50">
                      {methodsStatus === "loading" ? "Checking which payment methods Razorpay supports for this account. You can also continue to see the available options there."
                        : methodsStatus !== "ready" ? "We could not confirm UPI availability. Continue to Razorpay to choose from its available payment options."
                        : !upiAvailable && paymentMode === "test" ? "Razorpay has not enabled UPI for this test key. Use a test card or netbanking to complete a simulated purchase. Real UPI app and QR payments require an activated live account."
                        : !upiAvailable ? "UPI is currently unavailable for this Razorpay account. Choose another method inside Razorpay."
                        : paymentMode === "test" ? "Test mode: no money is charged. Use only the test payment options shown in Razorpay. Real UPI app and QR payments require live mode."
                        : "Razorpay shows supported UPI apps on mobile and a QR code on desktop. Availability also depends on the device and checkout eligibility."}
                    </p>
                  </fieldset>
                )}

                </fieldset>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {ebook.title}
                      </p>

                      <p className="mt-1 text-xs text-white/40">
                        Digital e-book
                      </p>
                    </div>

                    <p className="text-lg font-semibold text-white">
                      ₹
                      {Number(
                        ebook.price
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>

                {message && (
                  <p role="status" aria-live="polite" className={`mt-4 rounded-xl border px-4 py-3 text-sm leading-5 ${messageType === "success" ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-300" : messageType === "info" ? "border-blue-400/20 bg-blue-400/5 text-blue-300" : messageType === "warning" ? "border-amber-400/20 bg-amber-400/5 text-amber-300" : "border-red-400/20 bg-red-400/5 text-red-300"}`}>
                    {message}
                  </p>
                )}

                {confirmation && (
                  <div role="status" aria-live="polite" aria-atomic="true" className="mt-4 space-y-3">
                    <div className="flex gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-4">
                      <CircleCheck className="mt-0.5 shrink-0 text-emerald-400" size={22} aria-hidden="true" />
                      <div>
                        <h3 className="font-semibold text-emerald-300">{confirmation.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-white/70">{confirmation.description}</p>
                      </div>
                    </div>
                    <div className={`flex gap-3 rounded-xl border p-4 ${confirmation.emailSent ? "border-blue-400/20 bg-blue-400/5" : "border-amber-400/25 bg-amber-400/5"}`}>
                      {confirmation.emailSent ? <MailCheck className="mt-0.5 shrink-0 text-blue-400" size={22} aria-hidden="true" /> : <MailWarning className="mt-0.5 shrink-0 text-amber-400" size={22} aria-hidden="true" />}
                      <div className="min-w-0">
                        <h3 className={`font-semibold ${confirmation.emailSent ? "text-blue-300" : "text-amber-300"}`}>{confirmation.emailTitle}</h3>
                        <p className="mt-1 break-words text-sm leading-6 text-white/70">{confirmation.emailDescription}</p>
                      </div>
                    </div>
                  </div>
                )}

                {download?.url && (
                  <a href={download.url} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-400">
                    <Download size={18} aria-hidden="true" /> Download Your Ebook
                  </a>
                )}
                {download?.expiresAt && <p className="mt-2 text-center text-xs leading-5 text-white/40">Download link expires {new Date(download.expiresAt).toLocaleString()}. Save a copy to your device.</p>}

                {action !== "done" && <button
                  type="submit"
                  disabled={busy || (action === "pay" && serviceStatus !== "ready")}
                  className="mt-6 w-full rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy
                    ? (paymentDetails ? "Checking Purchase..." : "Opening Payment...")
                    : action === "email" ? "Retry Email Delivery (No Charge)"
                    : action === "verify" ? "Retry Payment Confirmation (No Charge)"
                    : "Continue to Payment"}
                </button>}

                <p className="mt-4 text-center text-xs text-white/30">
                  Secure payment powered by Razorpay
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
