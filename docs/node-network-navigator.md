# Node Network Navigator

Browser-based network health diagnostics under **Tech Tools**
(`/tech-tools/network-diagnostics`). Runs a one-tap assessment, interprets the
results with a deterministic rules engine, and saves reports.

## Saving options

The tool offers three ways to keep a result, in increasing order of setup:

1. **Save (local)** — stores the session in the browser (`localStorage`) for
   baseline comparison. Nothing to configure; data stays on that device.
2. **Report (PDF)** — the browser's print dialog produces a clean, branded
   one-page PDF. Nothing to configure.
3. **Google Sheets** — appends the run to two spreadsheets in Google Drive
   (mirrors the ClientsDesk approach). Requires the setup below; the button is
   hidden until it's configured.

## Google Sheets setup

Auth is client-side OAuth via Google Identity Services — the technician signs in
with Google and grants access to write the sheets. No server, no stored refresh
token, no secrets in the bundle (the OAuth **client ID is public by design**).

### 1. Google Cloud project

1. In the [Google Cloud console](https://console.cloud.google.com/), create (or
   pick) a project.
2. **APIs & Services → Library →** enable **Google Sheets API**.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID →**
   application type **Web application**.
4. Under **Authorized JavaScript origins**, add every origin the app runs on:
   - `http://localhost:8080` (local dev)
   - `https://anythingitechmv.com`
   - later: `https://app.marthasvineyardit.com`, etc.
5. Copy the **Client ID** (looks like `1234-abc.apps.googleusercontent.com`).
6. Configure the **OAuth consent screen** (External is fine). While it's in
   "Testing", add each technician's Google address under **Test users**.

### 2. The two spreadsheets

Create two spreadsheets in Google Drive and share both with **edit** access to
every technician who will sign in:

- **Sessions** — one row per assessment (summary + key metrics).
- **Findings** — one row per finding (linked to a session by `Session ID`).

Put the headers in row 1 of the first tab of each (tab names default to
`Sessions` and `Findings`). Column order must match:

**Sessions:** `Session ID`, `Saved At (ISO)`, `Label`, `Headline`,
`Rules Version`, `Download (Mbps)`, `Upload (Mbps)`, `Latency idle (ms)`,
`Latency loaded (ms)`, `Jitter (ms)`, `Packet loss (%)`, `DNS (ms)`, `IPv4`,
`IPv6`, `HTTPS reachable`, `Captive portal`, `Public IP`, `Expected download`,
`Expected upload`, `Expected link`, `Top finding`, `Top confidence`,
`Findings count`

**Findings:** `Session ID`, `Saved At (ISO)`, `Label`, `Finding`, `Category`,
`Severity`, `Confidence`, `Score`, `Evidence`, `Contradictions`, `Next tests`

> These headers are the single source of truth in
> `src/lib/diagnostics/googleSheets.ts` (`SESSIONS_HEADER`, `FINDINGS_HEADER`).
> If you change the columns there, update the sheets to match — the appended
> rows are positional.

The spreadsheet ID is the long token in its URL:
`https://docs.google.com/spreadsheets/d/`**`<THIS>`**`/edit`.

### 3. Environment variables

Set these in `.env.local` (dev) and in the Vercel project (prod). All are read
at build time; unset = the Google Sheets button stays hidden.

```
VITE_GOOGLE_CLIENT_ID=1234-abc.apps.googleusercontent.com
VITE_SHEETS_SESSIONS_ID=<sessions spreadsheet id>
VITE_SHEETS_FINDINGS_ID=<findings spreadsheet id>
# optional — only if your first tab isn't named Sessions / Findings
VITE_SHEETS_SESSIONS_TAB=Sessions
VITE_SHEETS_FINDINGS_TAB=Findings
```

### How it behaves

- First save triggers the Google sign-in/consent popup; the access token is kept
  in memory for the session and reused for later saves.
- On success the button shows **In Sheets**; on failure an inline alert explains
  why (cancelled sign-in, no edit access, wrong spreadsheet ID, etc.).
- The signed-in Google account must have edit access to both spreadsheets.

## Configuration reference

All endpoints and targets are env-overridable (`src/lib/diagnostics/config.ts`):

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_DIAG_DOWNLOAD_URL` | Sized download endpoint | Cloudflare `__down` |
| `VITE_DIAG_UPLOAD_URL` | Upload endpoint | Cloudflare `__up` |
| `VITE_DIAG_LATENCY_URL` | Latency/jitter/loss probe | Cloudflare `__down?bytes=0` |
| `VITE_DIAG_TRACE_URL` | Public IP + reachability | Cloudflare `cdn-cgi/trace` |
| `VITE_DIAG_IPV4_URL` / `VITE_DIAG_IPV6_URL` | IPv4/IPv6 probes | icanhazip |
| `VITE_GOOGLE_CLIENT_ID` | OAuth client ID | — (Sheets off) |
| `VITE_SHEETS_SESSIONS_ID` / `VITE_SHEETS_FINDINGS_ID` | Spreadsheet IDs | — (Sheets off) |

## Architecture note

The diagnostics core (`types.ts`, `rules.ts`, `compare.ts`, `config.ts`) is
framework-agnostic and dependency-free, so it can later lift into a shared
package for the planned iOS app / backend without a rewrite. Browser-only
adapters (`measurements.ts`, `history.ts`, `googleSheets.ts`) stay in the web
app. See `src/lib/diagnostics/index.ts`.
