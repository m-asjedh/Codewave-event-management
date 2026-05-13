# CodeWave — Event management

Monorepo for the CodeWave events platform: a **Next.js** frontend, **Serverless Framework** backend on AWS, and **GitHub Actions** for deploys.

## Layout

| Path                 | Purpose                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `frontend/`          | Next.js app — UI, event discovery, dashboard, Cognito (Amplify) auth, API-backed events. |
| `backend/`           | AWS Lambda / API Gateway via Serverless — handlers, `serverless.yml` when present.       |
| `.github/workflows/` | CI/CD — `deploy-backend.yml`, `deploy-frontend.yml`.                                     |
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

- **`frontend/.env.example`** → copy to **`frontend/.env.local`** and set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_COGNITO_USER_POOL_ID`, and `NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID`.
- **`backend/.env.example`** — keep `backend/.env` local only.

## Frontend ↔ API (CORS + base URL)

### Where to put `NEXT_PUBLIC_API_URL`

1. **Local:** `frontend/.env.local` (Next.js reads this automatically):

   ```bash
   NEXT_PUBLIC_API_URL=https://YOUR_API_ID.execute-api.ap-southeast-1.amazonaws.com
   ```

   No trailing slash. Use `getPublicApiBaseUrl()` from `frontend/lib/api-base.ts` when you add `fetch` calls.

2. **GitHub (production build):** add repository secrets and pass them into the **Deploy frontend** workflow (see table below) so static `out/` bakes in the correct API host and Cognito app client settings.

### Cognito (browser)

Set these in **`frontend/.env.local`** and as GitHub secrets for production builds:

| Variable                                  | Purpose                                               |
| ----------------------------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID`        | Cognito User Pool ID (same region as the pool).       |
| `NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID` | App client ID (no client secret — public SPA client). |

The app calls `Amplify.configure` on load and sends the **Cognito ID token** as `Authorization: Bearer …` on authenticated API requests (`frontend/lib/api.ts`).

### CORS (backend)

`backend/serverless.yml` uses **`CORS_ORIGIN`** for HTTP API CORS (`allowedOrigins`). Default is `*` if unset.

- **Tighter:** set GitHub secret **`CORS_ORIGIN`** to your CloudFront site origin, e.g. `https://d3d0peqnjgbcgd.cloudfront.net` (no trailing slash).
- **Quick test:** leave `CORS_ORIGIN` unset → `*` allows any browser origin.

Redeploy backend after changing **`CORS_ORIGIN`**.

## Deploy backend (Serverless)

GitHub Actions: **`.github/workflows/deploy-backend.yml`** on push to `main`.

**Secrets:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, optional `CORS_ORIGIN`, plus app vars (`MONGODB_URI`, …).

## Deploy frontend (S3 + CloudFront)

The app uses **`output: 'export'`** so `next build` writes static files to **`frontend/out/`** (no Node server — good for S3).

### One-time AWS setup

1. **S3 bucket** (e.g. `codewave-frontend-prod`) in `ap-southeast-1`. Keep the bucket private; serve traffic through **CloudFront** with **Origin Access Control (OAC)**.
2. **CloudFront distribution** — origin = S3 bucket with OAC; optional default root object **`index.html`**.
3. **IAM** for the deploy user: `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` on the bucket; `cloudfront:CreateInvalidation` on the distribution if you use cache invalidation.

### GitHub Actions

Workflow: **`.github/workflows/deploy-frontend.yml`** (runs when `frontend/**` changes on `main`).

**Secrets:**

| Secret                                        | Purpose                                                        |
| --------------------------------------------- | -------------------------------------------------------------- |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Deploy user (needs S3 sync + optional invalidation).           |
| `FRONTEND_S3_BUCKET`                          | Target bucket for `aws s3 sync out/`.                          |
| `FRONTEND_CLOUDFRONT_DISTRIBUTION_ID`         | Optional; invalidates `/*` after upload.                       |
| `NEXT_PUBLIC_API_URL`                         | **API HTTP URL** (no trailing slash); baked into static build. |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID`            | Cognito User Pool ID for Amplify in the browser.               |
| `NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID`     | Cognito app client ID (public client, no secret).              |

### Static export + dynamic URLs

`/events/[id]` and `/dashboard/events/[id]/edit` are pre-rendered for IDs in **`frontend/lib/static-export-ids.ts`**. Add IDs there for any path that must support **hard refresh** / direct link after build.

### Manual deploy (local)

```bash
cd frontend && npm ci && npm run build
aws s3 sync out/ s3://YOUR_BUCKET_NAME/ --delete --region ap-southeast-1
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## License

Private / your choice — update this section when you publish.
