This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment variables

The server validates a small set of environment variables during start-up. Create a `.env.local` with:

```bash
BACKEND_URL=https://api.example.com      # Base URL for the Smart Wallets backend
JWT_COOKIE_NAME=platform_jwt             # Optional – defaults shown
REFRESH_COOKIE_NAME=platform_refresh     # Optional – defaults shown
COOKIE_DOMAIN=.example.com               # Optional – omit for localhost
```

`BACKEND_URL` must be a valid URL; the other values fall back to the defaults above when omitted.
