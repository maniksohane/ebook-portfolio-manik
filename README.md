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
