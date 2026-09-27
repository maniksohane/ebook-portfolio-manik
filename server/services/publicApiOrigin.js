function getPublicApiOrigin(env = process.env) {
  const production = env.NODE_ENV === "production" || env.VERCEL === "1";
  const value = env.PUBLIC_API_URL?.trim() || (production ? "" : "http://localhost:5000");
  const unavailable = () => Object.assign(new Error("Checkout is temporarily unavailable. Please contact the seller; do not pay again."), { status: 503 });
  let url;
  try { url = new URL(value); } catch { throw unavailable(); }
  const local = url.hostname === "localhost" || url.hostname.endsWith(".localhost") || url.hostname === "[::1]" || /^127\./.test(url.hostname);
  if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== "/" ||
      (production && (url.protocol !== "https:" || local)) || url.hostname.endsWith(".supabase.co")) throw unavailable();
  return url.origin;
}

module.exports = { getPublicApiOrigin };
