"use client";

import { useState } from "react";
import { createRazorpayOrder } from "../lib/api";

const RAZORPAY_SCRIPT =
  "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");

    script.src = RAZORPAY_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

export default function RazorpayCheckout({ ebook }) {
  const [showBuyerForm, setShowBuyerForm] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [download, setDownload] = useState(null);

  function openBuyerForm() {
    setMessage("");
    setDownload(null);
    setShowBuyerForm(true);
  }

  function closeBuyerForm() {
    if (busy) return;

    setShowBuyerForm(false);
    setMessage("");
  }

  async function continueToPayment(event) {
    event.preventDefault();

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
        key: response.keyId,

        amount: response.amount,

        currency: response.currency,

        name: "Manikya Publishing",

        description: ebook.title,

        order_id: response.orderId,

        prefill: {
          name: `${trimmedFirstName} ${trimmedLastName}`,
          email: trimmedEmail,
          contact: trimmedPhone,
        },

        /*
         * UPI configuration
         *
         * This places UPI first and enables the
         * supported UPI flows including QR.
         */
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay using UPI",
                instruments: [
                  {
                    method: "upi",
                    flows: [
                      "qr",
                      "intent",
                    ],
                  },
                ],
              },
            },

            sequence: [
              "block.upi",
              "card",
              "netbanking",
              "wallet",
            ],

            preferences: {
              show_default_blocks: false,
            },
          },
        },

        handler: async function (paymentResponse) {
          try {
            setMessage(
              "Payment received. Verifying payment..."
            );

            const API =
              process.env.NEXT_PUBLIC_API_URL ||
              "http://localhost:5000";

            const verificationResponse =
              await fetch(
                `${API}/api/payment/verify-payment`,
                {
                  method: "POST",

                  headers: {
                    "Content-Type": "application/json",
                  },

                  body: JSON.stringify({
                    ebookId: ebook.id,

                    firstName:
                      trimmedFirstName,

                    lastName:
                      trimmedLastName,

                    razorpayPaymentId:
                      paymentResponse.razorpay_payment_id,

                    razorpayOrderId:
                      paymentResponse.razorpay_order_id,

                    razorpaySignature:
                      paymentResponse.razorpay_signature,
                  }),
                }
              );

            const data =
              await verificationResponse
                .json()
                .catch(() => ({}));

            if (!verificationResponse.ok) {
              throw new Error(
                data?.message ||
                  data?.error ||
                  "Payment verification failed."
              );
            }

            setMessage(
              data?.message ||
                "Payment successful. Your e-book has been sent to your email."
            );
            setDownload(data?.download || null);
          } catch (error) {
            setMessage(
              error?.message ||
                "Payment was completed, but verification could not be completed."
            );
          } finally {
            setBusy(false);
          }
        },

        modal: {
          ondismiss: function () {
            setBusy(false);
            setMessage("");
          },
        },

        theme: {
          color: "#2563eb",
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function () {
          setBusy(false);

          setMessage(
            "Payment failed. Please try again."
          );
        }
      );

      razorpay.open();
    } catch (error) {
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
        Buy Now
      </button>

      {showBuyerForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#111214] shadow-2xl">
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

                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  Complete Your Purchase
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/50">
                  Enter your details before continuing to
                  secure payment.
                </p>
              </div>

              <form onSubmit={continueToPayment}>
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
                  <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm leading-5 text-red-300">
                    {message}
                  </p>
                )}

                {download?.url && (
                  <a href={download.url} className="mt-4 block rounded-xl bg-blue-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-400">
                    Download Your Ebook Now
                  </a>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="mt-6 w-full rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy
                    ? "Opening Payment..."
                    : "Continue to Payment"}
                </button>

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
