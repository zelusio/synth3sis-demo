# Zelus Synth3sis API Demo
This is a  [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) that we built to show off
how easy it is to integrate the [Synth3sis API](https://docs.synth3sis.io) into your apps to offer invisible wallets, gas-less NFT minting and more to your users!

## Quick Links
Before we get started, are you **looking for more resources?** Check out the following quick Links
* [Synth3sis API Docs](https://docs.synth3sis.io) - Our official documentation
* [API Swagger Docs](https://sandbox.api.synth3sis.io/docs) - Swagger docs with a request builder
* [Synth3sis API Demo](https://demo.synth3sis.io) - This is a live version of this app :)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/mint](http://localhost:3000/api/mint). This endpoint can be edited in `pages/api/mint.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.


## Synth3sis API
The Synth3sis API is implemented in the `src/services/synth3sis.service.ts`. This service is called in the `/api/mint` API route (`src/pages/api/mint.ts`) 
 to create or retrieve a wallet for a user, and to mint an NFT for that user.