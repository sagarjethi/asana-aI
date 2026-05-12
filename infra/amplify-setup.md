# Deploying the AsanaAI frontend on AWS Amplify Hosting

The Next.js app at the repo root deploys to **AWS Amplify Hosting**
directly from GitHub. SSR, API routes, and ISR are all supported.

## 1. Push the repo to GitHub

```bash
git remote add origin git@github.com:<your-org>/<your-repo>.git
git push -u origin main
```

## 2. Create the Amplify app

1. Open the Amplify console → **Create new app** → **Host web app**.
2. Choose **GitHub** as the Git provider and authorize.
3. Pick your repository and the `main` branch.
4. Amplify auto-detects Next.js. Confirm the build settings — they will
   pick up `amplify.yml` from the repo root. No edits needed.
5. Add environment variables under **App settings → Environment
   variables**:

   ```
   NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   UPSTASH_REDIS_REST_URL=...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

6. Click **Save and deploy**.

## 3. Custom domain

In Amplify console → **Domain management** → add `your-domain.com` and
create the suggested CNAME records in Route 53 (or your DNS provider).
Amplify provisions an ACM certificate automatically.

## 4. Auto-deploys

Every push to `main` triggers a new build/deploy. Use feature branches
+ Amplify preview environments for staging.

## 5. Cost notes

Amplify Hosting charges per build-minute, per GB stored, and per GB
served. The Next.js SSR layer runs on Lambda under the hood — there are
no extra Lambda fees beyond the Amplify SKU.
