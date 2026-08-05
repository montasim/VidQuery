# VidQuery website

The VidQuery product website is a TanStack Start application using React, Tailwind CSS 4, and shadcn components. Netlify builds this workspace independently from the WXT extension.

## Development

From the repository root:

```bash
pnpm install
pnpm dev:web
```

The local site runs at `http://localhost:3000`.

## Validation

```bash
pnpm check:web
```

This generates the TanStack route tree, checks formatting and linting, runs strict TypeScript validation, and produces the Netlify client and SSR builds.

## Deployment

Connect the repository to Netlify, leave the base directory at the repository root, and set the package directory to `apps/web`. The committed `netlify.toml` builds `@vidquery/web` and publishes `apps/web/dist/client`.

The download CTA uses GitHub’s stable latest-release asset URL. Each extension release must therefore include `VidQuery-chrome-unpacked.zip`.
