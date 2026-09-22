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
