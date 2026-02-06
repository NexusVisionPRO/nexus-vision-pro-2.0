<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1DRs0L8rcriM64AMp0d-MdNDD7medaTJw

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
4. For OpenRouter usage (recommended): copy `.env.example` to `.env.local` and fill `OPENROUTER_API_KEY`.

## Deploy & Payments (overview)

Steps to connect to GitHub, deploy to Vercel and accept subscriptions with Mercado Pago:

- **GitHub**: create a new repository and push this project. Example:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

- **Vercel**: import the GitHub repo in Vercel. In Project Settings > Environment Variables add `OPENROUTER_API_KEY` (only for serverless functions) and `MP_ACCESS_TOKEN` for Mercado Pago server-side endpoints. Do NOT expose `MP_ACCESS_TOKEN` to the client.

- **Serverless proxy (recommended)**: Add a Vercel serverless function that forwards requests to OpenRouter and to Mercado Pago. This keeps your API keys secret. Implement endpoints like `/api/openrouter` and `/api/mercadopago/create-payment`.

- **Mercado Pago**: use server-side SDK or REST API to create payments/subscriptions. Store subscription status in your backend or use webhooks to update user accounts. Use `MP_PUBLIC_KEY` on the client to render checkout widgets if needed.

## Notes & Security

- The repository default used to call Gemini directly from the client. For production you SHOULD NOT expose your OpenRouter or Mercado Pago secret keys in client-side bundles. Use serverless functions on Vercel and keep secrets in Vercel Environment Variables.
- I included a simple OpenRouter client replacement at `services/geminiService.ts` that keeps the same `generatePrompts` export to minimize changes. Replace this with a server-side proxy for production.

If you want, I can:

- Add a Vercel serverless function scaffold for `openrouter` and `mercadopago` endpoints.
- Add GitHub Actions CI to run type checks and tests before deployment.
