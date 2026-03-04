# Sonic Website — Deployment Guide

## Architecture

```
Internet
  │
  ▼
Traefik (80/443)  ←── Let's Encrypt auto-SSL
  │
  ├─► traefik.yourdomain.co.za  →  Traefik Dashboard
  ├─► portainer.yourdomain.co.za →  Portainer UI
  └─► yourdomain.co.za           →  Sonic Website app
```

All services share the Docker network `traefik-public`.
DNS A records for all three subdomains must point to your VM IP.

---

## 1. SSH Key Setup (Windows → VM, passwordless)

### Generate your SSH key pair (run once on your Windows PC)

Open PowerShell:

```powershell
# Generate an Ed25519 key (fastest, most secure)
ssh-keygen -t ed25519 -C "sonic-deploy" -f "$env:USERPROFILE\.ssh\sonic_vm"

# View your public key (you'll need this for the VM)
Get-Content "$env:USERPROFILE\.ssh\sonic_vm.pub"
```

### Add your public key to the VM

You'll need one-time password access to the VM (via your cloud provider console or initial SSH with password):

```bash
# On the VM — create .ssh directory if it doesn't exist
mkdir -p ~/.ssh && chmod 700 ~/.ssh

# Paste your public key (the output from the step above)
echo "ssh-ed25519 AAAA...your-public-key... sonic-deploy" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Configure SSH on your Windows PC

Add this to `C:\Users\<YourUser>\.ssh\config` (create if it doesn't exist):

```
Host sonic-vm
    HostName YOUR_VM_IP_OR_DNS
    User YOUR_VM_USERNAME
    IdentityFile ~/.ssh/sonic_vm
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

### Connect

```powershell
ssh sonic-vm
```

No password prompt — key-based auth only.

### (Recommended) Disable password authentication on the VM

Once key auth works, lock down SSH:

```bash
# On the VM
sudo nano /etc/ssh/sshd_config

# Set these values:
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin no

# Restart SSH daemon
sudo systemctl restart sshd
```

---

## 2. VM Prerequisites

Run on the VM after SSH-ing in:

```bash
# Install Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker version
docker compose version
```

---

## 3. DNS Setup

Before deploying, create these DNS A records pointing to your VM's public IP:

| Record | Value |
|--------|-------|
| `yourdomain.co.za` | `VM_IP` |
| `traefik.yourdomain.co.za` | `VM_IP` |
| `portainer.yourdomain.co.za` | `VM_IP` |

Let's Encrypt will verify domain ownership via HTTP challenge, so DNS must resolve before you deploy.

---

## 4. Initial Server Setup (run once on VM)

```bash
# Create the shared Docker network (all stacks reference this)
docker network create traefik-public

# Clone the repo
git clone https://github.com/YOUR_ORG/sonic-website.git ~/sonic-website
cd ~/sonic-website
```

---

## 5. Deploy Traefik (deploy first)

```bash
cd ~/sonic-website/deploy/traefik

# Copy and fill in your values
cp .env.example .env
nano .env

# Create the ACME certificate storage file (must be chmod 600)
touch acme/acme.json
chmod 600 acme/acme.json

# Generate a hashed password for the Traefik dashboard
# Replace 'YOUR_PASSWORD' with your actual password
docker run --rm httpd:2.4-alpine htpasswd -nbB admin 'YOUR_PASSWORD' | sed -e s/\\$/\\$\\$/g
# Paste the output into TRAEFIK_DASHBOARD_AUTH in your .env file

# Start Traefik
docker compose up -d

# Verify it's running
docker compose logs -f
```

Traefik dashboard: https://traefik.yourdomain.co.za

---

## 6. Deploy Portainer

```bash
cd ~/sonic-website/deploy/portainer

cp .env.example .env
nano .env    # set DOMAIN to match your Traefik .env

docker compose up -d
```

Portainer UI: https://portainer.yourdomain.co.za

**Important:** Complete first-time Portainer setup within 5 minutes of starting, or it will lock you out (restart the container if needed).

---

## 7. Deploy the App (manual — via GitHub)

You'll do this step yourself via GitHub. The app needs:

### Required environment variables (.env on VM)

```env
DATABASE_URL="postgresql://sonic:STRONG_PASSWORD@db:5432/sonic_cms"
JWT_SECRET="generate-with: openssl rand -base64 64"
JWT_REFRESH_SECRET="generate-with: openssl rand -base64 64"
SESSION_TIMEOUT="14400000"
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://yourdomain.co.za"
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE="10485760"
MEDIA_URL="https://yourdomain.co.za/uploads"
```

### Traefik labels for the app container

When you create your app docker-compose, the app service needs these labels:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.sonic-app.rule=Host(`yourdomain.co.za`)"
  - "traefik.http.routers.sonic-app.entrypoints=websecure"
  - "traefik.http.routers.sonic-app.tls.certresolver=letsencrypt"
  - "traefik.http.services.sonic-app.loadbalancer.server.port=3000"
```

And it must be on the `traefik-public` network:

```yaml
networks:
  traefik-public:
    external: true
```

### Running database migrations

Migrations run automatically on container startup (via `docker-entrypoint.sh`).
To run manually:

```bash
docker run --rm --env-file .env ghcr.io/YOUR_ORG/sonic-website:latest \
  sh -c "node node_modules/prisma/build/index.js migrate deploy"
```

### Seeding the admin user (first deploy only)

```bash
docker run --rm --env-file .env ghcr.io/YOUR_ORG/sonic-website:latest \
  sh -c "node node_modules/prisma/build/index.js db seed"
```

---

## 8. Useful Commands

```bash
# View all running containers
docker ps

# View logs for a service
docker compose -f deploy/traefik/docker-compose.yml logs -f
docker compose -f deploy/portainer/docker-compose.yml logs -f

# Restart Traefik (e.g. after config change)
docker compose -f deploy/traefik/docker-compose.yml restart

# Update Portainer
docker compose -f deploy/portainer/docker-compose.yml pull
docker compose -f deploy/portainer/docker-compose.yml up -d

# Renew SSL certs manually (usually automatic)
docker exec traefik traefik healthcheck
```

---

## Troubleshooting

**Let's Encrypt fails:** DNS must propagate before deploying. Verify with `dig yourdomain.co.za`.

**Traefik dashboard not loading:** Check `acme.json` has `chmod 600`. Check logs with `docker compose logs traefik`.

**502 Bad Gateway:** The app container isn't running or isn't on `traefik-public` network.

**Portainer locked out:** `docker restart portainer` — you have 5 minutes after restart to set admin password.
