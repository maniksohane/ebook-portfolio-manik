"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import RazorpayCheckout from "./RazorpayCheckout";

const DESCRIPTION_PREVIEW_LENGTH = 190;

function descriptionPreview(description) {
  if (description.length <= DESCRIPTION_PREVIEW_LENGTH) return description;

  const preview = description.slice(0, DESCRIPTION_PREVIEW_LENGTH);
  const lastSpace = preview.lastIndexOf(" ");
  const safeEnd = lastSpace > 130 ? lastSpace : DESCRIPTION_PREVIEW_LENGTH;

  return `${preview.slice(0, safeEnd).trimEnd()}...`;
}

export default function EbookCard({ ebook }) {
  const [failedCover, setFailedCover] = useState(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const showCover = ebook.coverImage && failedCover !== ebook.coverImage;
  const description = ebook.description?.trim() || "";
  const hasLongDescription = description.length > DESCRIPTION_PREVIEW_LENGTH;
  const descriptionId = `ebook-description-${ebook.id}`;

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
      <div className="aspect-[3/4] w-full shrink-0 overflow-hidden border-b border-white/10 bg-[#101418]">
        {showCover ? (
          <img
            src={ebook.coverImage}
            alt={`${ebook.title} — ebook cover`}
            loading="lazy"
            decoding="async"
            onError={() => setFailedCover(ebook.coverImage)}
            className="block h-full w-full object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-5 text-white/40">
            <BookOpen size={40} aria-hidden="true" />
            <p className="text-sm">Cover unavailable</p>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5 text-left sm:p-6">
        <h3 className="break-words text-xl font-semibold leading-snug tracking-tight text-balance text-white">
          {ebook.title}
        </h3>

        {description && (
          <div className="mt-3">
            <p
              id={descriptionId}
              className="break-words text-sm leading-6 text-white/50"
            >
              {descriptionExpanded ? description : descriptionPreview(description)}
            </p>

            {hasLongDescription && (
              <button
                type="button"
                aria-expanded={descriptionExpanded}
                aria-controls={descriptionId}
                onClick={() => setDescriptionExpanded((current) => !current)}
                className="mt-2 rounded-md text-sm font-semibold text-blue-400 transition hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                {descriptionExpanded ? "Show less" : "... Read more"}
              </button>
            )}
          </div>
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
