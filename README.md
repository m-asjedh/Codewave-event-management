# CodeWave — Event management

Monorepo for the CodeWave events platform: a **Next.js** frontend on **AWS Amplify Hosting**, a **Serverless Framework** backend on AWS, and **GitHub Actions** for backend deploys.

## Layout

| Path                 | Purpose                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `frontend/`          | Next.js app — UI, event discovery, dashboard, Cognito (Amplify) auth, API-backed events. |
| `backend/`           | AWS Lambda / API Gateway via Serverless — handlers, `serverless.yml` when present.       |
| `.github/workflows/` | Backend CI/CD — `deploy-backend.yml`. Frontend builds/deploys via **Amplify** (app connected to this repo). |
| `project-spec.md`    | Architecture and MVP scope.                                                              |

## Prerequisites

- **Node.js 20+** (matches frontend tooling and typical Lambda runtime).
- **npm** in `frontend/` and `backend/`.

## Local development

```bash
cd frontend && npm install && npm run dev
```

```bash
cd backend && npm install && npx serverless print   # when serverless.yml exists
```

Copy env templates (do **not** commit real secrets):

- **`frontend/.env.example`** → copy to **`frontend/.env.local`** and set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_COGNITO_USER_POOL_ID`, and `NEXT_PUBLIC_COGNITO_CLIENT_ID`.
- **`backend/.env.example`** — keep `backend/.env` local only.

## Frontend ↔ API (CORS + base URL)

### Where to put `NEXT_PUBLIC_API_URL`

1. **Local:** `frontend/.env.local` (Next.js reads this automatically):

   ```bash
   NEXT_PUBLIC_API_URL=https://YOUR_API_ID.execute-api.ap-southeast-1.amazonaws.com
   ```

   No trailing slash. Use `getPublicApiBaseUrl()` from `frontend/lib/api-base.ts` when you add `fetch` calls.

2. **Production (Amplify):** set the same `NEXT_PUBLIC_*` values in the Amplify app’s **Environment variables** so the static export bakes in the correct API host, site URL, and Cognito client settings.

### Cognito (browser)

Set these in **`frontend/.env.local`** and in **Amplify environment variables** for production builds:

| Variable                                  | Purpose                                               |
| ----------------------------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID`        | Cognito User Pool ID (same region as the pool).       |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID`           | App client ID (no client secret — public SPA client). |

The app calls `Amplify.configure` on load and sends the **Cognito ID token** as `Authorization: Bearer …` on authenticated API requests (`frontend/lib/api.ts`).

### CORS (backend)

`backend/serverless.yml` uses **`CORS_ORIGIN`** for HTTP API CORS (`allowedOrigins`). Default is `*` if unset.

- **Tighter:** set GitHub secret **`CORS_ORIGIN`** to your deployed frontend origin, e.g. `https://main.xxxxx.amplifyapp.com` or your custom domain (no trailing slash).
- **Quick test:** leave `CORS_ORIGIN` unset → `*` allows any browser origin.

Redeploy backend after changing **`CORS_ORIGIN`**.

## Deploy backend (Serverless)

GitHub Actions: **`.github/workflows/deploy-backend.yml`** on push to `main`.

**Secrets:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, optional `CORS_ORIGIN`, plus app vars (`MONGODB_URI`, …).

## Deploy frontend (AWS Amplify Hosting)

The app uses **`output: 'export'`**, so `next build` writes static files to **`frontend/out/`** (no Node server at the edge).

### Amplify app setup

1. Connect this GitHub repo and branch (**`main`**).
2. Enable **monorepo** and set **`AMPLIFY_MONOREPO_APP_ROOT`** to **`frontend`** (or set the app root to `frontend` in the console).
3. **Build output directory:** **`out`** (not `.next` — static export).
4. **Frontend build command:** **`npm run build`** (run from `frontend/`).
5. In **Environment variables**, set at least **`NEXT_PUBLIC_API_URL`**, **`NEXT_PUBLIC_SITE_URL`** (your Amplify URL or custom domain, no trailing slash), **`NEXT_PUBLIC_COGNITO_USER_POOL_ID`**, and **`NEXT_PUBLIC_COGNITO_CLIENT_ID`** (or the exact names your app reads — see `frontend/lib/cognito-oidc.ts` and `frontend/lib/auth-context.tsx`).
6. In **Cognito**, allow the app client **callback** and **sign-out** URLs that match `NEXT_PUBLIC_SITE_URL` (see `frontend/lib/cognito-oidc.ts`).

### Static export + dynamic URLs

`/events/[id]` and `/dashboard/events/[id]/edit` are pre-rendered for IDs in **`frontend/lib/static-export-ids.ts`**. Add IDs there for any path that must support **hard refresh** / direct link after build.

### Local production build (sanity check)

```bash
cd frontend && npm ci && npm run build
```

Artifacts are under **`frontend/out/`**; Amplify uses the same build output when configured as above.

## License

Private / your choice — update this section when you publish.
