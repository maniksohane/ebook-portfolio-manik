"use client";

import RazorpayCheckout from "./RazorpayCheckout";

export default function EbookCard({ ebook }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
      <div className="aspect-[3/4] bg-white/5">
        <img
          src={ebook.coverImage}
          alt={ebook.title}
          className="block h-full w-full object-cover"
        />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-white">
          {ebook.title}
        </h3>

        {ebook.description && (
          <p className="mt-3 text-sm leading-6 text-white/50">
            {ebook.description}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-2xl font-bold text-white">
              ₹{Number(ebook.price).toFixed(2)}
            </p>

            <p className="mt-1 text-xs text-white/40">
              INR
            </p>
          </div>

          <RazorpayCheckout ebook={ebook} />
        </div>
      </div>
    </article>
  );
}
