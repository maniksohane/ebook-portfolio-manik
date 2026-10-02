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

### Cover uploads and replacements

The admin **Cover file** input accepts PDF, DOC, DOCX, PNG, JPG/JPEG and WebP
(including the common `.jepg` extension typo). Covers have a 10 MB limit. The
server validates the file contents and generates a PNG: PDF/Word covers use
their **complete first page**, while images retain their aspect ratio. The
catalogue displays the entire generated image without cropping. Arbitrary
files such as ZIP archives, executables or HTML are not valid covers.

For an existing book, choose **Edit → Replace cover → Save Changes**. You do
not need to re-upload or change the purchased ebook. Alternatively, enter a
path such as `covers/my-cover.pdf` in the Supabase cover field. This reads only
the public `ebook-covers` bucket, converts the file and links the generated
image to the book. Use either a file or a storage path, not both.

Uploading a document directly in Supabase does **not** automatically associate
it with a book. Use the admin form to link it. Deleting the linked image from
storage removes the cover from the site until you replace it. Original files
are never overwritten or deleted by conversion. Keep full paid ebooks in the
private `ebook-files` bucket; only cover pages belong in `ebook-covers`.

Runtime setup:

- Use **Node.js 22.13+ or 24+**, then run `npm.cmd install` inside `server`.
  PDF/image rendering dependencies are included in the lockfile.
- **DOC/DOCX additionally require LibreOffice installed on the API host**.
  On Windows, install LibreOffice Writer and optionally set
  `LIBREOFFICE_PATH=C:/Program Files/LibreOffice/program/soffice.exe` in
  `server/.env`. On a Linux API host, install `libreoffice-writer` and the fonts
  used by the documents. The executable can also be on PATH. Restart the API
  after setup. Without LibreOffice the form gives a setup error and does not
  replace the existing cover; PDF and images still work.
- For exact Word typography, supply the original fonts on the host or export
  the cover to PDF first. Conversion uses a temporary profile with macros
  disabled and a timeout. Only verified admins can invoke conversion. For
  production, run the API/converter as an unprivileged, resource-limited process
  and upload only trusted documents; headless conversion is not a sandbox.

`POST /api/admin/covers?filename=cover.pdf` accepts an authenticated binary
`application/octet-stream` body. `POST /api/admin/covers/import` accepts JSON
`{"path":"covers/cover.pdf"}`. Both return `cover_path` and `coverImage` after
saving a unique PNG. Save `cover_path` through the existing ebook create/update
endpoint. Errors leave the current ebook record unchanged. Generated covers
whose later ebook save fails may remain as unlinked files; no automatic storage
deletion is performed. No database migration or public ebook-file access is
required.

Tests: `npm.cmd test` inside `server` checks complete first-page rendering,
image formats, malformed files, size limits, missing Word runtime, storage
path restrictions and admin authorization. Word success needs a real
LibreOffice installation and is not established by the missing-runtime test.

References: [PDF.js rendering example](https://github.com/mozilla/pdf.js/blob/master/examples/node/pdf2png/pdf2png.mjs),
[LibreOffice conversion options](https://help.libreoffice.org/latest/en-GB/text/shared/guide/start_parameters.html),
[Supabase storage uploads](https://supabase.com/docs/reference/javascript/storage-from-upload).

### Delete an unwanted e-book

In `/admin`, **Delete** appears beside Edit and Publish/Unpublish. Confirm the
book title in the confirmation prompt to permanently remove the listing. The
list and book count update after the server confirms deletion. Uploaded covers,
PDFs, EPUBs and previews are intentionally retained in storage (files may be
shared); deleting a listing does not erase these files or provide an Undo action.

`DELETE /api/admin/ebooks/:id` requires an authenticated admin. Existing database
foreign keys block deletion of any book with transaction or download history,
including failed/pending/test orders. Use **Unpublish** for those books so buyers
retain access. No transaction, download or storage object is deleted, and no
schema migration is needed. Restart the backend after adding the new route.

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
`maniksohane@gmail.com`; no custom sending domain is required. Use Node.js 22.13 or
newer (this project is tested locally on Node.js 24).

1. Enable Google 2-Step Verification for the sending Gmail account.
2. Create an App Password at https://myaccount.google.com/apppasswords.
3. Set these values in the private `server/.env` file:

   ```dotenv
   SMTP_USER=maniksohane@gmail.com
   SMTP_APP_PASSWORD=YOUR_GMAIL_APP_PASSWORD
   EMAIL_FROM="Ebooks by Manik! <maniksohane@gmail.com>"
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

### Payment confirmation and download checks

After server verification, checkout shows **Payment verified**, a **Download
Your Ebook** button, and a separate **Email sent** notice containing the email
address saved on the purchase. That notice describes the download link and
receipt, not a PDF attachment. It appears only after SMTP accepted the buyer's
email. SMTP acceptance does not prove inbox placement; the buyer should check
inbox/spam. Failed email delivery keeps the paid download and no-charge email
retry available. The purchase form is hidden after successful verification.

The API verifies the HMAC signature, captured status, payment ID, stored order,
amount and currency before delivery. The frontend requires explicit
`paymentVerified: true` and `paymentStatus: "captured"`; a checkout callback alone
cannot display success. A missing ebook file blocks new order creation. If a
file goes missing after capture, confirmation requests help/retry without
claiming the ebook is ready or asking for another payment. Expired/exhausted
links are not silently renewed or advertised as ready.

Downloads require a captured transaction for the same ebook, a valid expiry and
remaining download allowance. The storage URL uses download disposition and a
maximum five-minute lifetime. File-preparation failure does not consume a click;
compare-and-set counter updates prevent concurrent clicks bypassing the limit.
Refunded transactions cannot be reactivated through callback replay. Refund
reconciliation and cross-process delivery idempotency still need additional
production work; this is not a complete refund/order-management system.

Before launch, configure a real `RAZORPAY_WEBHOOK_SECRET` and register your
public HTTPS `/api/payment/webhook` endpoint in Razorpay. Webhooks with absent,
placeholder or invalid secrets are rejected; signed events must match the
stored purchase. Callback-based local tests do not prove webhook delivery.
Set `PUBLIC_API_URL` to the deployed API URL: localhost email links are usable
only on the machine running this project.

Manual acceptance test (Razorpay test mode):

1. Refresh `/ebooks`, choose **Buy Now**, and enter your own email address.
2. Complete one simulated card/netbanking payment in Razorpay.
3. Confirm **Payment verified**, **Email sent**, the correct email address and
   a working ebook download. Check inbox/spam and the emailed link/receipt.
4. Close/reopen the purchase dialog: it must not ask for another payment.
5. Test a failed/cancelled payment separately: it must not release the ebook or
   display a successful-purchase confirmation.

References: [Razorpay verification and testing](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/),
[webhook validation](https://razorpay.com/docs/webhooks/validate-test/),
[Nodemailer recipient acceptance](https://nodemailer.com/).

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
