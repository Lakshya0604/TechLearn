# TechLearn

Full-stack e-learning platform. Instructors create courses with video lectures
(hosted on Cloudinary); students enroll through Stripe Checkout and track their
lecture progress.

## Stack

- **Client**: React 19, Vite, Redux Toolkit + RTK Query, Tailwind CSS, shadcn/ui
- **Server**: Node.js, Express 5, MongoDB (Mongoose), JWT auth in HTTP-only cookies
- **Infra**: Cloudinary (media), Stripe (payments), Render (hosting)

## Local development

```bash
cp .env.example .env   # fill in the values
npm install
npm install --prefix client
npm run dev            # API on :5000
npm run dev --prefix client   # Vite dev server on :5173
```

## Tests

```bash
npm test
```

Regression tests cover the authorization and payment rules: course ownership on
every mutation, instructor-only course creation, purchase-status gating, and
correct enrollment on payment verification.

## Production (Render)

```bash
npm run build   # installs deps and builds the client into client/dist
npm start       # serves API + built client together
```

Set every variable from `.env.example` in the service's environment. Use Stripe
**test** keys for demo deployments so checkout runs without real charges. The
Stripe webhook endpoint is `POST /api/v1/purchase/webhook`.
