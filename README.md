This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm install
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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment

⚠️ **Important**: This project contains 859MB of documentation files. Standard deployment to Netlify will fail due to function size limits.

### Quick Deployment Solutions

**Option 1: Vercel (Fastest - 2 minutes)**
```bash
npx vercel --prod
```

**Option 2: Cloudflare R2 + Netlify (Free forever)**
```bash
./scripts/upload-to-r2.sh
# Then follow steps in QUICK_START_FIX.md
```

**Option 3: Interactive Helper**
```bash
./scripts/deploy.sh
```

### Documentation

- 📖 **[DEPLOYMENT_FIX_SUMMARY.md](./DEPLOYMENT_FIX_SUMMARY.md)** - Quick overview of all solutions
- 📋 **[QUICK_START_FIX.md](./QUICK_START_FIX.md)** - Detailed step-by-step guides
- 🔧 **[DEPLOYMENT_SOLUTION.md](./DEPLOYMENT_SOLUTION.md)** - Comprehensive technical details

### Troubleshooting

If you see this error on Netlify:
```
could not parse form file: http: request body too large
```

This means the serverless function bundle exceeds Netlify's limits. Follow one of the solutions above.
