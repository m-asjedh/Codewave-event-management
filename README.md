# CodeWave — Event management

Monorepo for the CodeWave events platform: a **Next.js** frontend, **Serverless Framework** backend on AWS, and **GitHub Actions** for deploys.

## Layout

| Path | Purpose |
|------|---------|
| `frontend/` | Next.js app — UI, event discovery, dashboard, auth (ready to wire to Cognito + API). |
| `backend/` | AWS Lambda / API Gateway via Serverless — handlers, `serverless.yml` when present. |
| `.github/workflows/` | CI/CD (e.g. deploy backend on push to `main`). |
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

## Deploy

Configure GitHub **repository secrets** (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and app vars used in `.github/workflows/deploy.yml`), then push to `main` to run the workflow.

## License

Private / your choice — update this section when you publish.
