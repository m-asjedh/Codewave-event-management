# CodeWave — Event management

Monorepo for the CodeWave events platform: a **Next.js** frontend on **AWS Amplify Hosting**, a **Serverless Framework** backend on AWS, and **GitHub Actions** for backend deploys.

## Layout

| Path                 | Purpose                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `frontend/`          | Next.js app — UI, event discovery, dashboard, Cognito (Amplify) auth, API-backed events. |
| `backend/`           | AWS Lambda / API Gateway via Serverless — handlers, `serverless.yml` when present.       |
| `.github/workflows/` | Backend CI/CD — `deploy-backend.yml`. Frontend builds/deploys via **Amplify** (app connected to this repo). |
| `project-spec.md`    | Architecture and MVP scope.                                                              |

## AWS architecture (production)

CodeWave runs as a **serverless** stack in **`ap-southeast-1`**: browsers talk to **API Gateway HTTP API** and **Cognito**; Lambdas use **MongoDB** (Atlas URI), **S3** (banner uploads), **SQS**, and **SES**; the UI is a static **Next.js** export on **Amplify Hosting**. Backend deploys from **GitHub Actions** on push to `main` (`npx serverless deploy --stage prod`).

<img width="1651" height="824" alt="architecture-diagram" src="https://github.com/user-attachments/assets/8dcc3af6-a3a1-4642-8960-e7abb6babfdf" />

### AWS services used

| Service | Role in CodeWave |
| -------- | ---------------- |
| **API Gateway (HTTP API)** | Public HTTPS API; **JWT authorizer** validates Cognito tokens on protected routes; CORS restricted to the Amplify app origin in `serverless.yml`. |
| **Lambda** | HTTP handlers (`events/*`, `registrations/*`, `uploads/*`), **`dailyReminder`**, **`processEmail`**. Runtime **Node.js 20**. |
| **Amazon Cognito** | User sign-up / sign-in; frontend sends **ID token** as `Authorization: Bearer …`. Pool ID and app client ID are wired into Serverless for the authorizer issuer/audience. |
| **Amazon S3** | Stores **event banner** files under `banners/<cognito-sub>/`. The API returns a **presigned PUT** URL; the browser uploads directly to S3, then saves the public **object URL** in MongoDB as `bannerUrl`. |
| **EventBridge** | **Schedule** (`rate(1 day)`) invokes **`dailyReminder`**, which finds events starting within 24 hours and enqueues one SQS message per registration. |
| **SQS** | Decouples **email sending** from API responses: **register** and **dailyReminder** **send** messages; **`processEmail`** **consumes** them (batch up to 5). |
| **SES** | Sends plain-text **registration confirmation** and **event reminder** emails from `SES_EMAIL_FROM`. |
| **CloudWatch Logs** | Each Lambda writes logs (e.g. `dailyReminder: X events, Y messages queued`). |
| **IAM** | Lambda execution role: CloudWatch, SQS send/receive/delete, SES send, **S3 `PutObject` on `banners/*`** in the configured bucket. |
| **CloudFormation** | Serverless creates/updates the stack (API, Lambdas, integrations, EventBridge rule, SQS mapping). |
| **Amplify Hosting** | Hosts the exported Next.js site from the same repo (monorepo root `frontend/`). |
| **GitHub Actions** | On `main`, checks out code, assumes AWS via secrets, runs **`serverless deploy --stage prod`** with environment variables for Mongo, SQS, S3, Cognito, SES. |

### How services connect (integration)

1. **Frontend → API:** `NEXT_PUBLIC_API_URL` points at the HTTP API invoke URL. **Public** routes: `GET /health`, `GET /events`, `GET /events/{id}`. **Authenticated** routes send the Cognito **Bearer** token; API Gateway’s JWT authorizer checks issuer (user pool) and audience (app client) before invoking Lambda.
2. **Frontend → Cognito:** OIDC / hosted UI (see `frontend/lib/cognito-oidc.ts`) for login; tokens stored in the browser for API calls.
3. **Lambda → MongoDB:** `MONGODB_URI` (from GitHub secrets at deploy) connects with a pooled connection reused across invocations.
4. **Register flow:** `POST /events/{id}/register` writes **MongoDB**, then **SQS** `SendMessage` with a JSON payload; **`processEmail`** runs asynchronously and calls **SES**.
5. **Reminders:** **EventBridge** fires **`dailyReminder`** daily; it queries Mongo for soon‑starting events and registered users, then **SQS** → **`processEmail`** → **SES** (same shape of pipeline as register).
6. **Banner images:** Authenticated **`POST /uploads/banner-presign`** returns a short-lived **presigned PUT** URL and a stable **public object URL**. The browser **PUT**s the file to **S3** with the matching `Content-Type`, then stores **`publicUrl`** in **`bannerUrl`** when creating or updating an event. Public **read** access for `banners/*` is required so cards and detail pages can load images (see below).

### Key application features

- **Discover events** — public list and detail pages backed by the API.
- **Organizer dashboard** — create, edit, and delete **your** events (ownership enforced in Lambda using JWT `sub`).
- **Registration** — signed-in users register for an event; duplicate registration is handled gracefully; **confirmation email** is queued, not sent inline.
- **My registrations** — list event IDs the current user registered for; per-event **registration status** check.
- **Scheduled reminders** — daily job queues **24h-before** reminder emails for registered attendees.
- **Banner images** — organizers **upload** to **S3**; **`bannerUrl`** in the database is the public S3 object URL returned after upload.
- **Health check** — `GET /health` for monitoring.

Environment variable **`SECRET_MANAGER_ARN`** is present in Serverless config for optional use. **`S3_BUCKET_NAME`** is required for **banner uploads** (`POST /uploads/banner-presign`).

## HTTP API reference

Base URL: **`https://<api-id>.execute-api.ap-southeast-1.amazonaws.com`** (exact value is output after deploy; set as `NEXT_PUBLIC_API_URL` on Amplify). HTTP API uses the **`$default`** stage (no path prefix like `/prod`).

| Method | Path | Auth |
| ------ | ---- | ---- |
| `GET` | `/health` | No |
| `GET` | `/events` | No |
| `GET` | `/events/{id}` | No |
| `POST` | `/events` | Cognito JWT |
| `PUT` | `/events/{id}` | Cognito JWT |
| `DELETE` | `/events/{id}` | Cognito JWT |
| `POST` | `/events/{id}/register` | Cognito JWT |
| `GET` | `/events/{id}/registration` | Cognito JWT |
| `GET` | `/me/registrations` | Cognito JWT |
| `POST` | `/uploads/banner-presign` | Cognito JWT |

Request body for `POST /events` / `PUT /events/{id}`: JSON with at least `title`, `startsAt` (ISO date), `location`, **`bannerUrl`** (required **S3** URL under your bucket’s `banners/` prefix from **`POST /uploads/banner-presign`**); optional `description`. **Authorization** header: `Bearer <Cognito ID token>`.

**`POST /uploads/banner-presign`** — JSON body `{ "contentType": "image/jpeg" | "image/png" | "image/webp" }`. Response: `{ "uploadUrl", "publicUrl", "key", "expiresIn", "contentType" }`. The client must `PUT` the raw file bytes to `uploadUrl` with header `Content-Type` exactly equal to `contentType`.

### S3 bucket (banners)

1. Create a bucket in **`ap-southeast-1`** (same region as the API). Set **`S3_BUCKET_NAME`** in GitHub Actions secrets and redeploy so IAM allows `PutObject` under `banners/*`.
2. **Bucket CORS** (so the browser can `PUT` to the presigned URL from your app origin):

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedOrigins": [
      "https://main.d2r4vrx4lrmfru.amplifyapp.com",
      "http://localhost:3000"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

3. **Public read for banner objects** (so `publicUrl` works in `<img>` / `next/image`): add a bucket policy allowing `s3:GetObject` for `arn:aws:s3:::YOUR_BUCKET_NAME/banners/*` with `"Principal": "*"`. You may need to adjust **Block Public Access** so a bucket policy can grant read only for that prefix (or front banners with **CloudFront** instead of public objects — not configured in this repo).

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

Copy env for local dev (do **not** commit real secrets):

- **`frontend/.env.example`** → **`frontend/.env.local`**: set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_COGNITO_USER_POOL_ID`, and `NEXT_PUBLIC_COGNITO_CLIENT_ID`.
- **Backend:** create **`backend/.env`** locally with the same variables Serverless expects (`MONGODB_URI`, `SQS_QUEUE_*`, `COGNITO_*`, `SES_EMAIL_FROM`, etc.) when running `serverless deploy` or `serverless offline` from your machine.

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

`backend/serverless.yml` sets **`httpApi.cors.allowedOrigins`** to your deployed Amplify origin (see file). Change that list if the frontend URL changes, then redeploy.

- **Quick local testing** against a dev API: temporarily add `http://localhost:3000` (or your dev origin) to `allowedOrigins`, deploy a dev stage, and revert for production.

## Deploy backend (Serverless)

GitHub Actions: **`.github/workflows/deploy-backend.yml`** on push to `main` → **`npx serverless deploy --stage prod`** from `backend/`.

**Repository secrets** (GitHub → Settings → Secrets and variables → Actions) should include at least:

| Secret | Purpose |
| ------ | ------- |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | IAM user or keys allowed to run CloudFormation + Lambda + API Gateway + EventBridge + SQS + IAM in the target account. |
| `AWS_REGION` | e.g. `ap-southeast-1` (must match `serverless.yml`). |
| `MONGODB_URI` | MongoDB connection string (e.g. Atlas). |
| `SQS_QUEUE_URL` | Queue URL used by Lambdas to send messages. |
| `SQS_QUEUE_ARN` | Same queue’s ARN (for IAM + SQS event source on `processEmail`). |
| `COGNITO_USER_POOL_ID` / `COGNITO_CLIENT_ID` | JWT authorizer + optional app use. |
| `SES_EMAIL_FROM` | Verified SES identity for outbound mail. |
| `S3_BUCKET_NAME` | S3 bucket for **event banner** uploads (`banners/` prefix); required for `POST /uploads/banner-presign`. |
| `SECRET_MANAGER_ARN` | Passed through env (optional for current handlers). |

CORS allowed origins are configured in **`backend/serverless.yml`** (`httpApi.cors.allowedOrigins`); update and redeploy if your Amplify URL changes.

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
