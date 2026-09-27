# Vercel frontend deployment

This repository contains two independent applications: the Next.js frontend in
`client/` and the Express API in `server/`. The repository-root `package.json`
only launches local development tools. It is not a Next.js application.

## Required Vercel project settings

In **Settings > Build and Deployment**:

| Setting | Value |
| --- | --- |
| Root Directory | `client` |
| Framework Preset | Next.js |
| Install Command | `npm ci --include=dev` |
| Build Command | `npm run build` |
| Output Directory | Next.js default; turn off the override |
| Node.js Version | 24.x |

Save the **Root Directory section separately** from the framework/build settings.
Reopen the settings page and check that `client` is still saved. The configuration
in `client/vercel.json` pins the framework, install command and build command once
that directory is selected. It cannot set the project's Root Directory.

Do not leave the Install Command override enabled with an empty value: Vercel
can skip dependency installation and report **No Next.js version detected**.
Do not add a second Next.js dependency to the repository-root package to mask a
wrong Root Directory. Next.js is already declared in `client/package.json` and
its version is recorded in `client/package-lock.json`.

## Frontend environment variables

In the project's **Environment Variables** section, set the actual public values
from `client/.env.local` for Production (and Preview if needed):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the existing code also accepts a Supabase
  publishable key under this variable name)

Each Value field must contain only the value, without the variable name, `=`,
surrounding quotes, or whitespace. Never import `server/.env` into this frontend
project or give a server credential a `NEXT_PUBLIC_` prefix.

For the connected store, `NEXT_PUBLIC_API_URL` must be the public HTTPS API
origin, without `/api`, and `NEXT_PUBLIC_RAZORPAY_KEY_ID` must match that API's
key ID. Do not use localhost or the Supabase project URL as the Express API
origin. Deploying `client/` does not deploy the separate `server/` application.

## Redeploy and verify

1. Ensure the intended source changes have been committed and pushed to the
   connected GitHub branch. An unchanged old commit does not include local edits.
2. Save the project settings and environment variables.
3. Redeploy, without the existing build cache for this troubleshooting run.
4. Check that the logs show dependency installation, a detected Next.js version,
   and a successful `next build`. Then visit the new deployment URL.

A successful frontend build does not verify the payment API, webhook, purchase
email or download links. Keep these separate from the frontend build check.
Do not enable public sales using Razorpay test keys. Vercel Hobby is restricted
to non-commercial personal use; a commercial store requires an eligible plan.

References: [Vercel build settings](https://vercel.com/docs/builds/configure-a-build),
[vercel.json](https://vercel.com/docs/project-configuration/vercel-json),
[Hobby plan](https://vercel.com/docs/plans/hobby).
