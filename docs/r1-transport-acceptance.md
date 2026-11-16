# R1 transport and visual verification status

## Built
- Host-side TCP stream reader and bounded length framing.
- HMAC authenticated envelopes, strict per-run sequencing and scenario/controller identity validation.
- Single guest connection, fail-closed timeout, disconnection and bad-frame behavior.
- Real OS TCP integration tests using a **simulated Node client**, not a QNX guest.
- Browser Chrome E2E suite with a saved screenshot artifact and a 2D fallback interaction test.

## Critical missing gate
This does **not** connect a real QNX process. QNX SDP 8.0 license, native guest, source compilation, runtime logs and binary hashes must be independently supplied and verified. QNX client must implement the same strict wire encoding and HMAC authentication inside the authorized guest. Do not expose a guest/host TCP listener publicly; loopback server requires an authenticated private tunnel, e.g. from a segregated lab network.

A Node mock can show protocol behavior but cannot prove QNX-specific MsgSend timing, actual resmgr_attach, native target compatibility or closed-loop physical consequences.

## Visual truth
Playwright can verify browser controls and capture an actual renderer screenshot. The screenshot requires human visual review. Passing browser E2E does not mean cinematic industrial realism; original high-detail Blender models, PBR materials, texture licenses and measured FPS remain to be commissioned.

## Run
\`\`\`sh
npm test
cd apps/web
npm install
npx playwright install chromium
npm run test:e2e
\`\`\`

Use GitHub Actions logs and generated browser artifact for the acceptance review.
