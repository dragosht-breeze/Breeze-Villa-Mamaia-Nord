# Breeze OS v0.9.4-hotfix.3

## iOS hydration hardening

- Added `suppressHydrationWarning` only at the root `html`/`body` boundary to tolerate attributes injected by mobile browsers before React hydrates.
- Converted the homepage Hero from a Client Component to a Server Component.
- Removed unused Framer Motion wrappers from Hero, reducing the hydration surface on the public homepage.
- No visual or functional changes to the page.
