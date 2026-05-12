# Deploying the AsanaAI backend on AWS EC2

This walks through a clean, repeatable EC2 setup for the Express API in
`backend/`. The frontend stays on AWS Amplify (see `amplify.yml`); the API
gets its own EC2 instance, fronted by nginx with a TLS cert from Let's
Encrypt and supervised by PM2 via systemd.

## 1. Provision the instance

1. Launch an EC2 instance — **Ubuntu 24.04 LTS**, `t3.small` is a fine
   starting point. Larger if you plan to run pose-model inference
   server-side.
2. Security group rules:
   - **22/tcp** from your IP (SSH)
   - **80/tcp**, **443/tcp** from `0.0.0.0/0` (HTTP/HTTPS)
3. Allocate and associate an **Elastic IP** so the address survives
   restarts.
4. Point an `A` record `api.your-domain.com` → the Elastic IP.

## 2. Base packages

```bash
ssh ubuntu@api.your-domain.com
sudo apt update && sudo apt -y upgrade
sudo apt -y install nginx git build-essential certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs
sudo npm i -g pm2
```

## 3. Deploy the code

```bash
sudo mkdir -p /srv/asanaai && sudo chown ubuntu:ubuntu /srv/asanaai
cd /srv/asanaai
git clone https://github.com/<your-org>/<your-repo>.git .
cd backend
cp .env.example .env   # then edit with real values
npm ci
npm run build
```

## 4. Run under PM2 + systemd

```bash
pm2 start ecosystem.config.cjs
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
sudo mkdir -p /var/log/asanaai && sudo chown ubuntu:ubuntu /var/log/asanaai
```

Verify locally on the box:

```bash
curl -s http://127.0.0.1:8080/health | jq
```

## 5. nginx + TLS

```bash
sudo cp /srv/asanaai/infra/nginx.conf.example /etc/nginx/sites-available/asanaai
sudo ln -sf /etc/nginx/sites-available/asanaai /etc/nginx/sites-enabled/asanaai
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d api.your-domain.com --redirect --agree-tos -m you@your-domain.com -n
```

Certbot's systemd timer renews automatically.

## 6. Wire the frontend

In the Amplify console (App settings → Environment variables) set:

```
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
```

Then in any client code that calls the backend, prefix requests with
`process.env.NEXT_PUBLIC_API_BASE_URL`. Trigger a new Amplify build.

## 7. Updates

```bash
cd /srv/asanaai && git pull
cd backend && npm ci && npm run build
pm2 reload ecosystem.config.cjs
```

## 8. Suggested next steps

- Put the EC2 instance behind an **Application Load Balancer** once you
  scale past one box; move TLS termination to the ALB.
- Add **CloudWatch Agent** for structured logs.
- Migrate persistent state to **RDS** (Postgres) or **DynamoDB** instead
  of the placeholder TODO in `backend/src/routes/pose.ts`.
- Add a GitHub Action that SSHes in and runs the update flow on every
  push to `main`.
