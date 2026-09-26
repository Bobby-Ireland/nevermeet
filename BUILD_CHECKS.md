# Export checks

Verified on 26 September 2026 with Node.js 24.19.0 and pnpm 11.25.0:

- A fresh `pnpm install --frozen-lockfile` completed successfully.
- `pnpm typecheck` passed, including with no generated Next.js files present.
- `pnpm build` produced the static website in `out/` successfully.
- The local preview served the homepage, its referenced scripts and styles, the favicon and all 40 portraits: 50 routes/assets returned HTTP 200 with nonempty contents.
- The preview handled HEAD requests, missing files and unsupported request methods as expected.
- The website source, styles, components and portraits match the latest hosted project's source, including the mobile heading-spacing fix.
- The distribution contains source files and assets; generated build output, installed dependencies, local environment files and repository history are excluded.

The included GitHub workflow will run after you upload the project. A Cloudflare deployment will run after you connect the repository. Neither external service has been configured by this export.
