# Cinematic Pipeline — Frontend

Next.js 15 app for the cinematic commercial pipeline. Connects to NocoDB for treatments, shots, and sequences.

## Run locally

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
bun run build
bun start
```

## Deploy (Vercel)

1. Push to GitHub.
2. At [vercel.com](https://vercel.com), import the repo.
3. Set **Root Directory** to `frontend`.
4. Add env vars if needed (`NEXT_PUBLIC_NOCODB_URL`, etc.).
5. Deploy.

Vercel auto-detects Next.js and runs `bun run build` / `bun start`.

### Alternative: Deploy from monorepo root

If the repo root is the project root, Vercel can deploy from there. Add to root `vercel.json`:

```json
{
  "buildCommand": "cd frontend && bun install && bun run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && bun install"
}
```

Or simply set **Root Directory** to `frontend` in the Vercel project settings (recommended).
