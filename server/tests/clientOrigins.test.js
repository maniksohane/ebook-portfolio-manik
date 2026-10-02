const test = require("node:test");
const assert = require("node:assert/strict");
const { createCorsOriginCheck, parseClientOrigins } = require("../services/clientOrigins");

test("client origins support a trimmed comma-separated allowlist", () => {
  const origins = parseClientOrigins(
    "https://www.ebooksbymanik.com, https://ebooksbymanik.com,https://ebook-portfolio-manik.vercel.app",
  );

  assert.deepEqual([...origins], [
    "https://www.ebooksbymanik.com",
    "https://ebooksbymanik.com",
    "https://ebook-portfolio-manik.vercel.app",
  ]);
});

test("CORS allows listed and origin-free requests but rejects other websites", () => {
  const checkOrigin = createCorsOriginCheck(
    "https://www.ebooksbymanik.com,https://ebook-portfolio-manik.vercel.app",
  );

  const check = (origin) => new Promise((resolve, reject) => {
    checkOrigin(origin, (error, allowed) => error ? reject(error) : resolve(allowed));
  });

  return Promise.all([
    assert.doesNotReject(async () => assert.equal(await check(undefined), true)),
    assert.doesNotReject(async () => assert.equal(await check("https://www.ebooksbymanik.com"), true)),
    assert.doesNotReject(async () => assert.equal(await check("https://example.com"), false)),
  ]);
});
