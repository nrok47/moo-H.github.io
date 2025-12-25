# moo-health

Single-page web app for the “5 คำถามเปลี่ยนชีวิต” health check-in with real-time feedback, Ask–Affirm–Advice nudges, and a gamified HP bar.

## Getting started

```bash
npm install
npm run dev
```

Open the shown local URL (usually http://localhost:5173/) to try the questionnaire.

## Deploy (GitHub Pages)
- Base path is set to `/moo-H.github.io/` in `vite.config.ts`.
- A GitHub Actions workflow builds and deploys `dist` to Pages on every push to `main`.
- After the workflow finishes, the site is available at: https://nrok47.github.io/moo-H.github.io/

## Scripts
- npm run dev – start Vite dev server
- npm run build – type-check and build for production
- npm run preview – preview the production build
- npm run lint – run ESLint

## What’s inside
- React + TypeScript + Vite
- 5-step flow with energy slider, chips, and text input
- Real-time personalized feedback and nudges after each answer
- HP/progress bar and summary cards for rewards, obstacles, and first-step “magic”
