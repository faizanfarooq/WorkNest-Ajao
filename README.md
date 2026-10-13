# WorkNest

An internship marketplace: students build one profile and apply to internships; companies post roles, review applicants and message candidates.

**Stack:** React 19 + Vite + Tailwind · Express 5 + Mongoose 9 · MongoDB (Atlas) · Zod schemas shared by client and server.

## Run it locally

Requires Node 20.6+.

```bash
npm install

# Option A: no database needed. Starts an in-memory MongoDB with demo data (wiped on exit).
npm run dev:memory

# Option B: your Atlas database
cp .env.example .env        # then fill in MONGODB_URI and JWT_SECRET
npm run seed                # demo data (skips if users already exist; --reset wipes first)
npm run dev
```

Open http://localhost:5173. Demo logins (password `Password123`):

| Role | Email |
|---|---|
| Student | `student@worknest.test` |
| Employer (Ledgerly) | `employer@worknest.test` |
| Other employers | `hiring@<company-slug>.test`, e.g. `hiring@northstar-studio.test` |

Password-reset emails print to the API console unless `RESEND_API_KEY` is set.

Optional extras, both off until configured in `.env`:

- **Continue with Google**: set `GOOGLE_CLIENT_ID` (an OAuth "Web application" client from Google Cloud, with your site under *Authorized JavaScript origins*). The button stays hidden without it.
- **Email verification**: set `REQUIRE_EMAIL_VERIFICATION=true` once email delivery works. New password sign-ups then get a link and can't apply to or publish internships until they click it. Google sign-ups count as verified already.

## Static demo (GitHub Pages)

`npm run build:demo` builds a version that needs no server or database: an in-browser backend (`web/src/demo/server.ts`) answers the same API routes, validates with the same shared schemas, and stores data in the visitor's browser (localStorage, resumes in IndexedDB). A bar at the top switches between the student and employer demo accounts and resets the data.

Each visitor gets their own private copy, so two people can't interact with each other in the demo. For that, deploy the real app (see Vercel below).

`.github/workflows/pages.yml` publishes it on every push to `main` or `rebuild`. One-time setup in the GitHub repo:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. Pages only deploys from the default branch unless you allow others. Either merge into `main`, or add `rebuild` under **Settings → Environments → github-pages → Deployment branches**.

The demo is then at `https://<user>.github.io/<repo>/`. Try it locally with `npm run dev:demo`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | API on :4000 (auto-restart) + Vite on :5173 (proxies `/api`) |
| `npm run dev:memory` | Same, against a throwaway in-memory MongoDB with demo data |
| `npm run dev:demo` / `build:demo` | Static demo with the in-browser backend (no API needed) |
| `npm run seed` | Load demo data into `MONGODB_URI` |
| `npm test` | API tests (in-memory MongoDB) and demo-backend tests |
| `npm run typecheck` | TypeScript across server, shared and web |
| `npm run build && npm start` | Production build served by the API process |

## Layout

```
shared/schemas.ts        Zod schemas + constants used by both sides
server/
  app.ts                 Express app (middleware, routes, error handler)
  start.ts / index.ts    Local server entry
  config/env.ts          Env validation; refuses to start if config is missing
  middleware/auth.ts     JWT access tokens, role guards
  lib/                   HTTP errors + validation, mailer
  modules/<feature>/     model.ts + routes.ts (+ service.ts)
    auth                 register/login/refresh/logout, password reset & change
    profiles             student profile, resume upload (GridFS)
    companies            public pages, employer company settings
    internships          search, CRUD, saved internships
    applications         apply, student tracker, employer pipeline
    messages             conversations per application (polling)
    notifications        in-app notifications
  seed.ts                Demo data
api/index.ts             Vercel serverless entry
web/src/
  lib/                   API client (silent token refresh), auth context, formatting
  components/            UI kit, layout, internship card/detail/apply
  pages/                 Routes
tests/api.test.ts        End-to-end API tests
```

## How auth works

- Login returns a 15-minute **access token** (kept in memory only) and sets a 30-day **refresh token** in an `httpOnly` cookie scoped to `/api/auth`.
- Refresh tokens are random, stored hashed, and **single-use**: each refresh issues a new one. Logout, password reset and password change revoke them.
- The client retries any 401 once after a silent refresh.

## Deploying to Vercel (free tier)

1. Push the repo to GitHub and import it in Vercel.
2. Add `MONGODB_URI`, `JWT_SECRET` and `CLIENT_URL` (your Vercel URL) as environment variables.
3. In Atlas → Network Access, allow `0.0.0.0/0` (Vercel's IPs aren't fixed).

`vercel.json` serves the built SPA and routes `/api/*` to the Express app in `api/index.ts`. Design choices that keep it serverless-friendly: resumes live in MongoDB GridFS (no extra storage service, 2 MB cap under Vercel's 4.5 MB body limit), and chat uses polling instead of WebSockets.

Note: Vercel's Hobby plan is for non-commercial use, and the rate limiter's memory resets per serverless instance.

## Not built yet

Payments, AI features, admin panel, email verification, company team invites, real-time sockets, file storage outside Mongo.
