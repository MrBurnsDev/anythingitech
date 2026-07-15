# Node Network Navigator

Browser-based network health diagnostics under **Tech Tools**
(`/tech-tools/network-diagnostics`). Runs a one-tap assessment, interprets the
results with a deterministic rules engine, and produces reports.

## v1 goal

Prove the tech works, with **all data stored locally** — nothing on any server
of ours, no accounts, no cloud dependency. A technician can run an assessment,
read an interpreted diagnosis, save runs on the device, compare against a
baseline, and hand the client a PDF.

### Saving in v1

1. **Save (local)** — stores the session in the browser (`localStorage`) so it
   can be set as a baseline and compared against later runs. Stays on that
   device; see `src/lib/diagnostics/history.ts`.
2. **Report (PDF)** — the browser's print dialog produces a clean, branded
   one-page report (print stylesheet in `src/index.css` + `print:` utilities on
   the page). Save-as-PDF or print; the file is the user's to keep.

Both are zero-config and involve no third party.

## Configuration (v1)

Only the diagnostic endpoints are configurable, all via Vite env vars with
sensible public defaults (`src/lib/diagnostics/config.ts`). The engine never
depends on a single provider (spec §6).

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_DIAG_DOWNLOAD_URL` | Sized download endpoint | Cloudflare `__down` |
| `VITE_DIAG_UPLOAD_URL` | Upload endpoint | Cloudflare `__up` |
| `VITE_DIAG_LATENCY_URL` | Latency/jitter/loss probe | Cloudflare `__down?bytes=0` |
| `VITE_DIAG_TRACE_URL` | Public IP + reachability | Cloudflare `cdn-cgi/trace` |
| `VITE_DIAG_IPV4_URL` / `VITE_DIAG_IPV6_URL` | IPv4/IPv6 probes | icanhazip |

## Planned for v2 — user-owned cloud storage (Google Drive)

Deferred by design. The guiding principle: **Anything iTech never stores or
holds anyone else's data — each user owns their own data in their own Google
Drive.** This mirrors the **ClientsDesk** app, which creates a `ClientsDesk`
folder in the *user's* Drive, gives each client its own folder, keeps a central
CRM spreadsheet of clients + notes, and writes invoice/estimate PDFs into
per-client subfolders.

v2 will align Node Network Navigator to that model:

- On Google sign-in, find-or-create a folder **in the signed-in user's Drive**
  (per-client subfolders), matching ClientsDesk's naming.
- Save each diagnostic **report PDF into the client's folder**.
- Append a summary row to a **CRM spreadsheet that lives in the user's Drive**.

Design constraints for v2 (so the ownership principle holds):

- **Scope `drive.file`, not full Drive** — the app can only touch files it
  created; it cannot read the rest of the user's Drive.
- **Client-side OAuth, no server, no stored token** — the access token lives in
  the user's browser for the session only and is never sent to us. (This is also
  why a hosted database like Supabase was rejected: it would make us the
  custodian again.)

Exact folder naming, CRM columns, and the auth flow will be copied from the
ClientsDesk repo once it's accessible from the session, rather than approximated.

## Architecture note

The diagnostics core (`types.ts`, `rules.ts`, `compare.ts`, `config.ts`) is
framework-agnostic and dependency-free, so it can later lift into a shared
package for the planned iOS app / backend without a rewrite. Browser-only
adapters (`measurements.ts`, `history.ts`) stay in the web app. See
`src/lib/diagnostics/index.ts`.
