"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import RazorpayCheckout from "./RazorpayCheckout";

export default function EbookCard({ ebook }) {
  const [failedCover, setFailedCover] = useState(null);
  const showCover = ebook.coverImage && failedCover !== ebook.coverImage;

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
      <div className="flex h-72 shrink-0 items-center justify-center overflow-hidden border-b border-white/10 bg-[#101418] sm:h-80">
        {showCover ? (
          <img
            src={ebook.coverImage}
            alt={`${ebook.title} — ebook cover`}
            loading="lazy"
            decoding="async"
            onError={() => setFailedCover(ebook.coverImage)}
            className="block h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 p-5 text-white/40">
            <BookOpen size={40} aria-hidden="true" />
            <p className="text-sm">Cover unavailable</p>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5 text-left sm:p-6">
        <h3 className="break-words text-xl font-semibold leading-snug tracking-tight text-balance text-white">
          {ebook.title}
        </h3>

        {ebook.description && (
          <p className="mt-3 break-words text-sm leading-6 text-white/50">
            {ebook.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-6">
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
