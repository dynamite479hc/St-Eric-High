# Moving media storage to Cloudflare R2

This replaces Supabase Storage as the home for uploaded photos (staff photos,
leadership photos, history timeline photos, and the Gallery/Media Library).
Existing files already uploaded to Supabase Storage keep working — the site
reads old and new files correctly either way — but everything uploaded from
now on goes to R2 instead.

## 1. Create the R2 bucket
In the Cloudflare dashboard: **R2 → Create bucket**. Name it `st-eric-media`
(or update `bucket_name` in `worker/wrangler.toml` to match whatever you
name it).

## 2. Make the bucket public
Still in the bucket's settings, either:
- **Connect a custom domain** (e.g. `media.stelichigh.org`) under
  **Settings → Public Access → Custom Domains** — recommended, since it's a
  stable URL you control, or
- Enable the **r2.dev** public URL Cloudflare gives you for quick testing.

Either way, copy that public base URL — you'll need it in step 4.

## 3. Deploy the Worker
From the `worker/` folder, using [Wrangler](https://developers.cloudflare.com/workers/wrangler/):

```
npm install -g wrangler
wrangler login
wrangler deploy
```

This publishes `media-upload-worker.js` using the config in `wrangler.toml`,
and gives you a Worker URL like
`https://st-eric-media-worker.<your-subdomain>.workers.dev`.

## 4. Fill in the config
Two files need the real values once you have them:

**`worker/wrangler.toml`** (then redeploy with `wrangler deploy`):
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` — same values as in
  `assets/js/supabase-client.js`
- `PUBLIC_BASE_URL` — the public URL from step 2

**`assets/js/r2-client.js`**:
- `R2_WORKER_URL` — the Worker URL from step 3
- `R2_PUBLIC_BASE_URL` — the same public URL from step 2

## 5. Test it
Sign in at `admin-login.html`, open `admin-media.html`, and upload a photo.
It should appear immediately and its URL should point at your R2 public
domain rather than Supabase. Staff/Leadership/History photo uploads
(`admin-staff.html`, `admin-leadership.html`, `admin-history.html`) work
the same way.

## Why the Worker exists
R2's own upload API needs an access key, and that key can never be safely
shipped to the browser — anyone could read it from the page source and
upload or delete files freely. The Worker sits in between: the browser
sends it the admin's existing Supabase login token, the Worker checks
that token is valid with Supabase, and only then touches R2. The R2
credentials themselves stay inside Cloudflare and never reach the client.
JD
