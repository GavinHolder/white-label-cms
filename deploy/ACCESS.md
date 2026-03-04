# Sonic Website — Access & Operations Reference

## Quick Access

| What | URL | Credentials |
|------|-----|-------------|
| **SSH into VM** | `ssh sonic-vm` | Key-based (no password) |
| **Traefik Dashboard** | http://192.168.17.157:8080 | No auth (LAN only) |
| **Portainer UI** | http://192.168.17.157:9000 | Set on first login |
| **Website (live)** | https://sonic.capitalg.co.za | — |
| **Admin panel** | https://sonic.capitalg.co.za/admin | admin / sonic2026 |

---

## Your SSH Key

```
C:\Users\gavin\.ssh\sonic_vm       ← private key (keep secret, never share)
C:\Users\gavin\.ssh\sonic_vm.pub   ← public key (installed on VM)
```

Connect anytime: `ssh sonic-vm`

---

## Deployment Pipeline

### How it works (automatic on every push to `main`)

```
You push code to main
       │
       ▼
GitHub Actions — Job 1 (GitHub's servers)
  Builds Docker image → pushes to ghcr.io/ridiculus/sonic-website:latest
       │
       ▼
GitHub Actions — Job 2 (self-hosted runner ON your VM)
  Calls Portainer webhook → Portainer pulls new image → restarts stack
       │
       ▼
https://sonic.capitalg.co.za — live with new code
```

### Trigger a deploy manually
GitHub → Actions tab → "Deploy to Production" → Run workflow

---

## One-Time Setup Checklist

### Step 1 — Install GitHub Actions runner on VM

The self-hosted runner runs ON the VM so GitHub can deploy to your private LAN
without exposing SSH to the internet.

```bash
ssh sonic-vm

# Create runner directory
mkdir -p ~/actions-runner && cd ~/actions-runner

# Download runner — check https://github.com/actions/runner/releases for latest
curl -o runner.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.322.0/actions-runner-linux-x64-2.322.0.tar.gz
tar xzf runner.tar.gz

# Register — get YOUR token from:
# https://github.com/Ridiculus/sonic-website/settings/actions/runners/new
./config.sh \
  --url https://github.com/Ridiculus/sonic-website \
  --token YOUR_TOKEN_HERE \
  --name sonic-vm \
  --unattended

# Install as a system service (survives reboots)
sudo ./svc.sh install && sudo ./svc.sh start

# Verify it's online
sudo ./svc.sh status
```

Then add the runner to the docker group so it can run Docker commands:
```bash
sudo usermod -aG docker sonic
sudo ~/actions-runner/svc.sh stop && sudo ~/actions-runner/svc.sh start
```

The runner appears as **online** at:
`https://github.com/Ridiculus/sonic-website/settings/actions/runners`

---

### Step 2 — Create the app stack in Portainer

1. Open Portainer: http://192.168.17.157:9000
2. Go to: **Stacks → Add stack**
3. Name it: `sonic-app`
4. Choose: **Web editor**
5. Paste the contents of `deploy/app/docker-compose.yml`
6. Click **Deploy the stack**

That's it — Portainer now owns and manages the app.

---

### Step 3 — Get the stack webhook URL from Portainer

1. Portainer → **Stacks → sonic-app**
2. Scroll down to **Webhook** section
3. Enable the webhook toggle
4. Copy the webhook URL — it looks like:
   `http://localhost:9000/api/stacks/webhooks/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
5. Copy just the UUID part (the last segment after `/webhooks/`)

---

### Step 4 — Add GitHub secrets

Go to: `https://github.com/Ridiculus/sonic-website/settings/secrets/actions`

Add:

| Secret name | Value |
|-------------|-------|
| `PORTAINER_WEBHOOK_ID` | The UUID from step 3 |

---

### Step 5 — Set up the .env on VM

```bash
ssh sonic-vm
cd ~/sonic-deploy/app
cp .env.example .env
nano .env
```

Fill in:
- `POSTGRES_PASSWORD` — make up a strong password
- `DATABASE_URL` — update with same password
- `JWT_SECRET` — run `openssl rand -base64 64` on VM, paste result
- `JWT_REFRESH_SECRET` — run `openssl rand -base64 64` again, different value

---

### Step 6 — Seed the database (first deploy only)

After the first successful deploy:
```bash
ssh sonic-vm
docker exec sonic-app node node_modules/prisma/build/index.js db seed
```

Admin login: **admin / sonic2026** — change after first login.

---

## Common Operations (all via Portainer UI)

- **Start / Stop / Restart** containers → Portainer → Stacks → sonic-app
- **View logs** → Portainer → Containers → sonic-app → Logs
- **View resource usage** → Portainer → Containers → sonic-app → Stats
- **Redeploy manually** → Portainer → Stacks → sonic-app → Redeploy

---

## Terminal Operations (when you need CLI)

### SSH in
```bash
ssh sonic-vm
```

### Check what's running
```bash
sudo docker ps
```

### View app logs from terminal
```bash
sudo docker logs sonic-app -f --tail 100
```

### Connect to database
```bash
sudo docker exec -it sonic-db psql -U sonic -d sonic_cms
```

### Restart Traefik (e.g. if SSL cert issue)
```bash
cd ~/sonic-deploy/traefik && sudo docker compose restart
```

### Check disk / memory
```bash
df -h / && free -h
```

---

## SSL Certificate Troubleshooting

Traefik handles SSL automatically. Once DNS resolves, cert appears within ~1 min.

Check cert status:
```bash
sudo docker logs traefik -f --tail 30
```

If cert fails:
- Confirm `dig sonic.capitalg.co.za` returns your public IP
- Confirm router forwards port 80 → 192.168.17.157 (needed for HTTP challenge)

---

## Infrastructure Layout on VM

```
~/sonic-deploy/
├── traefik/
│   ├── docker-compose.yml
│   ├── .env                  ← ACME_EMAIL=admin@sonicdns.co.za
│   └── acme/acme.json        ← SSL certs (auto-managed by Traefik)
├── portainer/
│   └── docker-compose.yml
└── app/
    ├── docker-compose.yml    ← paste this into Portainer when creating stack
    └── .env                  ← DB password, JWT secrets — fill in!

~/actions-runner/             ← GitHub Actions self-hosted runner
```
