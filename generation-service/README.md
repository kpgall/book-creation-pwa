# Secure Generation Service

This folder is intentionally separate from the static GitHub Pages PWA.

Never place an API key in app.js, index.html, GitHub Pages, or any other browser-delivered file.

## Local test
1. Install Node.js.
2. Copy `.env.example` to `.env`.
3. Put your API key in `.env`.
4. Run `npm install`.
5. Run `npm start`.
6. The service exposes `/health` and `/api/generate`.

For the live PWA, deploy this service to a server/platform that supports Node and environment variables, then enter its HTTPS base URL in Book Creation Studio.

Before public use, restrict CORS to your PWA origin and add authentication/rate limiting.
