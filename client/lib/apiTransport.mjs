const unavailable = "The store service is temporarily unavailable. Please try again later.";

function isLocal(hostname) {
  return hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "[::1]" || /^127\./.test(hostname);
}

// A deployed frontend must never send payment details to a visitor's localhost.
export function resolveApiOrigin({
  value = process.env.NEXT_PUBLIC_API_URL,
  production = process.env.NODE_ENV === "production",
  pageOrigin = typeof window !== "undefined" ? window.location.origin : undefined,
} = {}) {
  const publicPage = pageOrigin && !isLocal(new URL(pageOrigin).hostname);
  const needsHttps = publicPage || (production && !pageOrigin);
  const configured = value?.trim();
  if (!configured && needsHttps) throw new Error(unavailable);
  let url;
  try { url = new URL(configured || "http://localhost:5000"); }
  catch { throw new Error(unavailable); }
  if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== "/" ||
      (needsHttps && (url.protocol !== "https:" || isLocal(url.hostname))) ||
      url.hostname.endsWith(".supabase.co")) {
    throw new Error(unavailable);
  }
  return url.origin;
}

export async function requestJson(path, options = {}, {
  fetchImpl = fetch, timeoutMs = 45000, apiOrigin,
} = {}) {
  const origin = apiOrigin ?? resolveApiOrigin();
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (options.signal?.aborted) abort();
  options.signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, timeoutMs);
  try {
    let response;
    try {
      response = await fetchImpl(`${origin}${path}`, { ...options, signal: controller.signal, cache: "no-store" });
    } catch {
      throw new Error("Could not reach the store service. Check your connection and try again.");
    }
    const data = await response.json().catch(() => null);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error(unavailable);
    if (!response.ok || data.success === false) {
      const message = response.status < 500 && typeof data.message === "string" ? data.message : unavailable;
      throw new Error(message);
    }
    return data;
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", abort);
  }
}

export async function checkStoreService({ signal } = {}) {
  const data = await requestJson("/api/health", { signal }, { timeoutMs: 10000 });
  if (data.success !== true) throw new Error(unavailable);
}
