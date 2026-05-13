# CodeWave — Event management

Monorepo for the CodeWave events platform: a **Next.js** frontend, **Serverless Framework** backend on AWS, and **GitHub Actions** for deploys.

## Layout

| Path | Purpose |
|------|---------|
| `frontend/` | Next.js app — UI, event discovery, dashboard, auth (ready to wire to Cognito + API). |
| `backend/` | AWS Lambda / API Gateway via Serverless — handlers, `serverless.yml` when present. |
| `.github/workflows/` | CI/CD — backend (`deploy.yml`) and frontend S3 sync (`deploy-frontend.yml`). |
| `project-spec.md` | Architecture and MVP scope. |

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

- `backend/.env.example` if you add one — keep `backend/.env` local only.

## Deploy backend (Serverless)

GitHub Actions: `.github/workflows/deploy.yml` on push to `main`.

**Secrets:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, plus optional env passed to Lambdas (`MONGODB_URI`, `SQS_QUEUE_URL`, …).

## Deploy frontend (S3 + CloudFront)

The app uses **`output: 'export'`** so `next build` writes static files to **`frontend/out/`** (no Node server — good for S3).

### One-time AWS setup

1. **S3 bucket** (e.g. `codewave-frontend-prod`) in `ap-southeast-1`. Keep the bucket private; serve traffic through **CloudFront** with **Origin Access Control (OAC)**.
2. **CloudFront distribution** — origin = S3 bucket with OAC; optional default root object **`index.html`**.
3. **IAM** for the deploy user: `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` on the bucket; `cloudfront:CreateInvalidation` on the distribution if you use cache invalidation.

### GitHub Actions

Workflow: **`.github/workflows/deploy-frontend.yml`** (runs when `frontend/**` changes on `main`).

**Secrets:**

| Secret | Purpose |
|--------|---------|
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Deploy user (needs S3 sync + optional invalidation). |
| `FRONTEND_S3_BUCKET` | Target bucket for `aws s3 sync out/`. |
| `FRONTEND_CLOUDFRONT_DISTRIBUTION_ID` | Optional; invalidates `/*` after upload. |

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
