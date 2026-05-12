# AsanaAI

> AI-powered yoga partner — pick a pose, turn on your camera, get
> real-time feedback. Pose estimation runs in your browser, so nothing
> leaves your device.

## Stack

- **Frontend** — Next.js 14 (App Router), TypeScript, Tailwind, TensorFlow.js
- **Auth & data** — Supabase, Upstash Redis
- **Backend (separate service)** — Node 20 + Express, in `backend/`
- **Hosting** — Frontend on **AWS Amplify Hosting**, backend on **AWS EC2**

## Layout

```
.
├── app/                  Next.js App Router pages, components, API routes
├── components/           shadcn/ui primitives
├── hooks/, lib/, utils/  Shared client utilities
├── public/, images/      Static assets
├── backend/              Express API deployed to EC2
├── infra/
│   ├── amplify-setup.md  Frontend (Amplify) deploy walkthrough
│   ├── ec2-deploy.md     Backend (EC2 + nginx + PM2 + Let's Encrypt) walkthrough
│   └── nginx.conf.example
├── amplify.yml           Amplify build config
└── ...
```

## Local development

### Frontend

```bash
npm install
npm run dev
# http://localhost:3000
```

You'll need a `.env.local` with at least:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
# http://localhost:8080/health
```

## Deployment

| Layer    | Target          | How                                             |
| -------- | --------------- | ----------------------------------------------- |
| Frontend | AWS Amplify     | Push to GitHub → Amplify auto-builds via `amplify.yml`. Full guide: [`infra/amplify-setup.md`](infra/amplify-setup.md) |
| Backend  | AWS EC2         | Ubuntu + Node 20 + PM2 + nginx + Let's Encrypt. Full guide: [`infra/ec2-deploy.md`](infra/ec2-deploy.md) |

Once both are up, set `NEXT_PUBLIC_API_BASE_URL` in Amplify to your EC2
domain (e.g. `https://api.your-domain.com`) and rebuild the frontend.

## Roadmap

- [ ] Migrate Next.js `/api/*` routes into `backend/` as the EC2 service
      matures.
- [ ] Add more pose definitions to the catalogue.
- [ ] CI: GitHub Action to ssh-deploy the backend on push to `main`.

## License

UNLICENSED — private project.
