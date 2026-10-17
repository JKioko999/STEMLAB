# Security and login changes

## What changed
- Passwords are hashed (scrypt). Existing plaintext passwords upgrade to hashes on each user's next sign-in.
- Sign-in returns a signed session token (12 hours). Every API route now requires it except sign-in,
  registration, password reset, health, and the public school/class lists used by sign-up.
- API responses never include `password` or `tempPassword`. Browser storage no longer holds them either.
- Password reset is server-verified. The 6-digit code is never stored or sent to the browser; the old
  client-side fallback that accepted a locally generated code is gone. Unknown emails get the same response as known ones.
- Changing a password requires either your current password (signed in) or a verified reset code.
- The browser no longer talks to Supabase directly, so the anon key is not needed client-side.
- Account creation can no longer overwrite an existing account with the same email.
- `/api/reset` is disabled in production. `/api/health` is minimal; details are super-admin only.
- Role checks: only staff can create/edit experiments, assignments and grades; only admins can create
  classes or delete users; school admins can only act inside their own school.
- First super admin needs `SUPER_ADMIN_SETUP_KEY`; once one exists, only a super admin can add another.
- Students now have a password field (before, student passwords never reached the server).

## Do these after deploying
1. In Vercel set `SESSION_SECRET` and `SUPER_ADMIN_SETUP_KEY` (see `.env.example`). Confirm `SUPABASE_SERVICE_ROLE_KEY` is set.
2. Run `server/db/lockdown.sql` in the Supabase SQL editor (turns on Row Level Security).
3. Rotate the Supabase anon key if this repo was public while it was ever committed anywhere, and rotate any
   key that was ever pasted into the browser build (any `VITE_` variable is public).

## Not done yet
- Most data routes (experiments, attempts, assignments) check role but not school ownership, so a teacher
  in one school could in principle read another school's records by ID. Needs per-route school scoping.
- The app still keeps a copy of school data in browser localStorage and syncs from it. It works, but the
  server should become the only source of truth.
- Rate limiting is per serverless instance, so it slows guessing but is not a hard limit.
- Self-service school sign-up does not verify the email address.
