const test = require("node:test");
const assert = require("node:assert/strict");

test("slugify converts pasted titles into safe storage paths", async () => {
  const { slugify } = await import("../../client/lib/slug.mjs");

  assert.equal(
    slugify("The Dynamics 365 CE/CRM Customer Service Bible"),
    "the-dynamics-365-ce-crm-customer-service-bible",
  );
});

test("slugify removes unsafe punctuation and normalizes accents", async () => {
  const { slugify } = await import("../../client/lib/slug.mjs");

  assert.equal(slugify("  Déjà Vu: Sales & Service!  "), "deja-vu-sales-service");
  assert.match(slugify("A".repeat(200)), /^[a-z0-9-]{1,120}$/);
});
