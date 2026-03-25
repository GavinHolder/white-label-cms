# White-Label CMS — New Client Deployment Checklist

> Standard setup for every client instance. Follow this exactly to ensure
> consistent deployments and working auto-update pipelines.

---

## Overview: How It Works

```
git push → GitHub Actions builds image → pushes to ghcr.io → Portainer webhook triggers → container restarts
```

Every client has:
- Their own GitHub repo (fork of this repo)
- Their own Docker image on GHCR (`ghcr.io/gavinholder/<client>-cms:latest`)
- Their own Portainer stack on the shared VPS
- One GitHub secret (`PORTAINER_WEBHOOK_URL`) wiring the two together

---

## Step 1 — Create Client GitHub Repo

1. Fork `https://github.com/GavinHolder/white-label-cms` as `<client>-cms`
   - e.g. `sonic-cms`, `ovbreadymix-cms`
2. In the fork, update `.github/workflows/deploy.yml`:
   - Change `IMAGE: ghcr.io/gavinholder/white-label-cms` → `ghcr.io/gavinholder/<client>-cms`
3. In the fork, update `deploy/app/docker-compose.yml`:
   - Change `image: ghcr.io/gavinholder/white-label-cms:latest` → `ghcr.io/gavinholder/<client>-cms:latest`
4. Push to main — this triggers the first image build

---

## Step 2 — Make the GHCR Package Public

After the first GitHub Actions build completes:

1. Go to `https://github.com/users/GavinHolder/packages/container/<client>-cms/settings`
2. Set visibility to **Public**

This allows Portainer to pull the image without authentication.

---

## Step 3 — Create Portainer Stack

In Portainer → **Stacks → Add stack → Repository**:

| Field | Value |
|---|---|
| Stack name | `<client>-cms` (e.g. `sonic-cms`) |
| Repository URL | `https://github.com/GavinHolder/<client>-cms.git` |
| Branch | `refs/heads/main` |
| Compose path | `deploy/app/docker-compose.yml` |
| Authentication | ✅ Enable |
| Username | `GavinHolder` |
| Personal Access Token | GitHub PAT with `repo` + `read:packages` scope |

### Environment Variables (paste into Portainer env editor)

```
APP_NAME=<client>-cms
BASE_DOMAIN=<client-domain.co.za>
STAGING_DOMAIN=<staging-domain>
DATABASE_URL=postgresql://<user>:<password>@db:5432/<dbname>
POSTGRES_USER=<user>
POSTGRES_PASSWORD=<password>
POSTGRES_DB=<dbname>
JWT_SECRET=<64-char hex — generate: openssl rand -hex 32>
JWT_REFRESH_SECRET=<64-char hex — generate: openssl rand -hex 32>
SESSION_TIMEOUT=14400000
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://www.<client-domain.co.za>
SKIP_MIGRATIONS=false
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760
MEDIA_URL=https://www.<client-domain.co.za>/uploads
```

> **STAGING_DOMAIN:** Set this to the VPS hostname (e.g. `clientweb.dedicated.co.za`) during
> initial setup so you can access the site before DNS cutover. Clear it once live on BASE_DOMAIN.

Deploy the stack. Wait ~60s for migrations to complete (watch container logs).

---

## Step 4 — Enable GitOps Webhook

1. Portainer → Stacks → `<client>-cms` → **Edit**
2. Scroll to **GitOps updates** → toggle **ON**
3. Select **Webhook** (not Polling)
4. Copy the generated webhook URL:
   `https://portainer.<domain>/api/stacks/webhooks/<uuid>`
5. Click **Save settings**

---

## Step 5 — Add GitHub Secret

1. Go to `https://github.com/GavinHolder/<client>-cms/settings/secrets/actions`
2. Click **New repository secret**
3. Name: `PORTAINER_WEBHOOK_URL`
4. Value: the webhook URL from Step 4
5. Click **Add secret**

---

## Step 6 — Verify the Pipeline

Push any change to `main` (or trigger manually via GitHub Actions → Run workflow).

Expected flow:
1. GitHub Actions: `upstream-merge` (skipped on push) → `build` → `deploy`
2. `build` job pushes new image to GHCR
3. `deploy` job POSTs to Portainer webhook → returns `200`
4. Portainer pulls new image and restarts the container

Check in Portainer → Containers → `<client>-cms-app` → Logs for startup messages.

---

## GitHub Secrets Reference

| Secret | Required | Description |
|---|---|---|
| `PORTAINER_WEBHOOK_URL` | **Yes** | Full webhook URL from Portainer stack GitOps settings |
| `UPSTREAM_REPO_URL` | No | Upstream CMS repo for updates. Defaults to `https://github.com/GavinHolder/white-label-cms.git` |

> `GITHUB_TOKEN` is automatic — no setup needed.

---

## DNS Cutover (when going live on BASE_DOMAIN)

1. Add DNS A records: `www.<domain>` + `<domain>` → VPS public IP
2. In Portainer, update stack env vars:
   - `NEXT_PUBLIC_API_URL` → `https://www.<domain>`
   - `MEDIA_URL` → `https://www.<domain>/uploads`
   - `STAGING_DOMAIN` → `` (clear/empty)
3. Portainer → Stacks → `<client>-cms` → **Pull and redeploy**

---

## CMS Auto-Update (from Admin Panel)

The **Update Now** button in Admin → Settings triggers a `workflow_dispatch` on the client repo
with `merge_upstream=true`. This:

1. Merges latest changes from `white-label-cms` into the client repo
2. Rebuilds the Docker image with the new code
3. Portainer webhook redeploys the container

No manual action needed after setup is complete.

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| GHCR pull fails (403) | Package is private | Make package public (Step 2) |
| Portainer webhook returns 404 | GitOps not saved | Save settings in Portainer after enabling webhook |
| Portainer webhook returns non-200 | Wrong URL or webhook disabled | Re-copy URL from Portainer, check GitOps is ON |
| Container starts but site errors | Missing env vars | Check Portainer env vars, redeploy |
| Login fails | Seed not run | Seed runs automatically on every boot via `docker-entrypoint.sh` |
| Update Now does nothing | `PORTAINER_WEBHOOK_URL` not set | Add secret to GitHub repo |

---

## Active Client Deployments

| Client | Repo | VPS | Stack | Domain |
|---|---|---|---|---|
| Sonic Internet | `sonic-cms` | 165.73.86.236 | `sonic-cms` | sonic.co.za |
| Overberg Ready Mix | `ovbreadymix-cms` | 154.66.197.168 | `ovbreadymix-cms` | ovbreadymix.co.za |
