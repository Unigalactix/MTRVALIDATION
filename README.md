<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI-Powered MTR Validation

Production-ready Vite + React + TypeScript app with secure client-side API key input, Tailwind build pipeline, and automated GitHub Pages deployment.

## Local Development

- Prerequisite: Node.js 18+ (22 recommended)
- Install deps and start dev server:

```powershell
npm install
npm run dev
```

Open the app, click "Manage API Key" and paste your Gemini API key. The key is stored in `sessionStorage` for the current tab session only.

## Build

```powershell
npm run build
npm run preview
```

## GitHub Pages Deployment

- A workflow at `.github/workflows/deploy.yml` builds and deploys on pushes to `main`.
- Vite `base` is set to `/MTRVALIDATION/` for project Pages.
- After the first successful run, enable Pages in the repo settings to use the "GitHub Actions" source if prompted.

## Security Notes

- No environment variables are bundled. The app prompts for the Gemini API key at runtime and stores it in `sessionStorage`.
- Every API request instantiates a fresh client with the provided key.
