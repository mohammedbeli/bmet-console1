# BMET Console — deployable project (Vercel)

A browser-based AI diagnostic console for biomedical equipment technicians,
ready to deploy on Vercel — free, no credit card required.

## What's in here

- `src/App.jsx` — the React frontend (the console UI)
- `api/diagnose.js` — a serverless function that calls the Anthropic API
  using your key, kept server-side, never exposed to the browser
- `vite.config.js` — build tool config for the frontend

Vercel automatically turns anything in `api/` into a live endpoint at
`/api/...`, and automatically detects this as a Vite project — no extra
config file needed.

## One-time setup

1. **Install the Vercel CLI**
   ```
   npm install -g vercel
   npm install
   ```
   (the second command installs the frontend's own dependencies)

2. **Get an Anthropic API key**
   From https://console.anthropic.com → API Keys.

3. **Log in**
   ```
   vercel login
   ```
   This opens a browser to sign in (email or GitHub/GitLab) — no card
   needed anywhere in this flow.

4. **Link the project** (run once from this folder)
   ```
   vercel link
   ```
   Answer the prompts — it'll create a new Vercel project for you.

5. **Add your API key as an environment variable**
   ```
   vercel env add ANTHROPIC_API_KEY
   ```
   Paste your key when prompted, and select all three environments
   (Production, Preview, Development) when asked.

## Deploy

```
vercel --prod
```

Vercel builds the frontend and deploys the function together, then prints
your live URL — something like `https://bmet-console.vercel.app`. That's
the link to share on LinkedIn.

## Trying it locally first (optional)

```
vercel dev
```
This runs the frontend and the `/api/diagnose` function together on your
machine, using the environment variable you added above, so you can test
before deploying.

## Updating later

Whenever you change the frontend or the function:
```
vercel --prod
```
Every push creates a new deployment; the same live URL always points to
your latest `--prod` deploy.
