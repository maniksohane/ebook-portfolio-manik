# Developer Portfolio + E-Book Store — Supabase

Next.js + Tailwind + Framer Motion frontend, Express backend, Supabase PostgreSQL/Auth/Storage, and Razorpay.

## Setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in Supabase SQL Editor.
3. Optionally run `supabase/seed.sql`.
4. Copy `server/.env.example` to `server/.env`.
5. Copy `client/.env.example` to `client/.env.local`.
6. Add Supabase and Razorpay credentials.
7. Run `npm install` in root, client, and server.
8. Run `npm run dev`.

Frontend: http://localhost:3000
API: http://localhost:5000

IMPORTANT: `SUPABASE_SECRET_KEY` (the Supabase service-role key) and `RAZORPAY_KEY_SECRET` are server-only. Set `NEXT_PUBLIC_API_URL` to the API origin (for example, `http://localhost:5000`), without `/api`.
Private PDFs live in the private `ebook-files` bucket. After successful Razorpay signature verification, the API creates a short-lived Supabase signed URL.

If PowerShell blocks npm.ps1, use `npm.cmd install` or:
`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

## First admin
Create an account at `/account`, then in Supabase SQL Editor run:
`update public.profiles set role = 'admin' where id = 'YOUR_AUTH_USER_UUID';`
Sign in and open `/admin` to upload a cover and a private PDF, create the title, and publish it.

## Razorpay UPI and QR checkout

The Key ID is a Razorpay checkout key, not a separate UPI key. Keep its matching
`RAZORPAY_KEY_SECRET` only in `server/.env`. Checkout uses the `keyId`, amount and
currency returned with the server-created order. `NEXT_PUBLIC_RAZORPAY_KEY_ID`
in `client/.env.local` should match the server Key ID; it is used only for the
initial test-mode notice. Restart the API and frontend after changing keys.

For INR purchases, the buyer form checks `GET /api/payment/methods` before
offering **UPI / QR code**. This public endpoint uses Razorpay's Methods API with
Key ID-only authentication, returns only mode/key/UPI availability, and caches
successful lookups for 60 seconds per key. UPI stays disabled while availability
is unknown or the account does not support it. Buyers can always continue to
**Available methods** and choose from Razorpay's own options. Restart the backend
after installing this change so the new route is available.

Razorpay determines the final available methods for the account and device:

- **Test keys (`rzp_test_...`)**: simulated transactions only. A key may return
  `upi: false` alongside `upi_intent: true`; the intent flag does not make UPI
  app/QR payments usable in test mode. For such keys, use a test card or simulated
  netbanking. Only offer sandbox UPI if the Methods API explicitly enables it.
  Do not scan a test QR expecting a real UPI payment.
- **Live keys (`rzp_live_...`)**: after account/website approval and UPI enablement,
  Checkout requests UPI app intent and QR flows. Supported mobile devices show
  UPI apps; desktop Checkout displays the scannable QR. The site does not create
  an unrelated static QR or expose the Key Secret.
- Card/netbanking and other account-enabled alternatives remain available.
  Non-INR orders are not forced into UPI.

If UPI is missing in live mode, check UPI enablement and account/website approval
in Razorpay Dashboard, or ask Razorpay support to enable it. A checkout display
configuration cannot activate a disabled merchant payment method. UPI Collect
(manual UPI ID entry) has also been deprecated for most merchants; use supported
Intent/QR flows instead. Availability checks never create orders or payments.

Downloads and purchase email still require server-side signature, amount, order
and captured-payment verification. Selecting UPI or scanning a QR is not proof
of payment. Real UPI Intent/QR verification requires a live-mode payment and is
not covered by mocked tests or a successful API credential check.

References: [Razorpay testing instructions](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/#2-test-integration),
[UPI Intent and desktop QR](https://razorpay.com/docs/payments/payment-methods/upi/upi-intent/),
[payment method configuration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/understand-configuration/).

## Purchase email from Gmail

Purchase emails now use Gmail SMTP, not Resend. The sender is configured as
`maniksohane@gmail.com`; no custom sending domain is required. Use Node.js 20 or
newer (this project is tested locally on Node.js 24).

1. Enable Google 2-Step Verification for the sending Gmail account.
2. Create an App Password at https://myaccount.google.com/apppasswords.
3. Set these values in the private `server/.env` file:

   ```dotenv
   SMTP_USER=maniksohane@gmail.com
   SMTP_APP_PASSWORD=YOUR_GMAIL_APP_PASSWORD
   EMAIL_FROM="Manikya Publishing <maniksohane@gmail.com>"
   ```

4. From `server`, run `npm.cmd run email:check`. This checks Gmail authentication
   without sending any email. Restart the API after changing `.env`.

Never use your normal Gmail password, paste App Passwords into chat, commit them,
or put SMTP settings into `client/.env.local`. Spaces in Google's displayed App
Password are ignored. A previously configured `RESEND_API_KEY` is no longer used.
The `EMAIL_FROM` address must match `SMTP_USER`. Optional
`OWNER_NOTIFICATION_EMAIL` sends a BCC; leave it blank to disable.

The email contains a private download link and a payment receipt. Configure
`PUBLIC_API_URL` with your deployed HTTPS API origin before selling to visitors:
an email link pointing at `localhost` only works on the computer running the API.
Gmail has sending limits and may restrict automated mail; SMTP acceptance does
not guarantee inbox delivery, so check spam and bounce notices.

Email failure never changes a confirmed payment to a failure. The buyer retains
the download and can retry email delivery from the same open checkout without a
new payment. This retry proof is held in page memory, not persisted across a full
reload. Existing failed purchases are not automatically resent by configuring
Gmail, and there is no background email retry queue.

Run `npm.cmd test` in `server` for mocked email, payment-delivery, and checkout
retry tests. Tests do not contact Gmail, charge payments, or change Supabase data.

## Automatic GitHub sync (Windows)

Saved source changes are automatically committed and pushed to `main` in
`https://github.com/maniksohane/ebook-portfolio-manik.git` after 15 seconds without
further edits. Unsaved editor changes cannot be synced. Keep the project in its
current location while the Windows startup entry is enabled.

Run these commands from the project root:

```powershell
# Enable now and at future Windows sign-ins (current user only)
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/git-auto-sync.ps1 -Action Install

# Check the watcher and the latest sync result
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/git-auto-sync.ps1 -Action Status

# Pause before doing manual Git operations
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/git-auto-sync.ps1 -Action Stop

# Resume
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/git-auto-sync.ps1 -Action Start

# Stop and remove automatic startup
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/git-auto-sync.ps1 -Action Uninstall
```

Equivalent root npm scripts are `sync:enable`, `sync:status`, `sync:stop`,
`sync:start`, and `sync:disable`. `sync:check` runs the file checks without
committing or pushing, and `test:sync` verifies the watcher against a temporary
local Git repository.

The watcher uses your existing Git credentials, writes logs/state under `.git/`,
and retries network failures. It excludes environment secrets, build output,
dependencies, local audit reports, and ebook PDFs/EPUBs. Environment templates
must contain placeholder credentials. Possible credentials in source files,
manually staged changes, another active Git operation, a different branch/remote,
or newer commits on GitHub pause syncing. Resolve the reported issue and the
watcher retries automatically; it never force-pushes or merges your changes.

Auto-sync publishes saves without a build/test gate, so work in progress can
reach GitHub. It only updates the repository; it does not deploy the website,
change Supabase, or verify an email domain.
