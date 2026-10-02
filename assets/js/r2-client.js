// ============================================================
// Fill these in once the Worker is deployed (see worker/README.md):
// ============================================================
const R2_WORKER_URL = "https://st-eric-media-worker.joydeewrkrrobtics.workers.dev"; // e.g. https://st-eric-media-worker.yoursubdomain.workers.dev
const R2_PUBLIC_BASE_URL = "https://pub-6937844a3d744fd7909830f79e7d83d4.r2.dev"; // same value as PUBLIC_BASE_URL in wrangler.toml

// Uploads a file through the Worker into R2, into the given folder
// (e.g. "staff", "leadership", "history", "gallery").
// Returns { path, url } — store url directly in the relevant
// *_path column (photo_path, storage_path, etc).
async function uploadToR2(file, folder) {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error("Not signed in");

  const res = await fetch(`${R2_WORKER_URL}/upload`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${session.access_token}`,
      "Content-Type": file.type || "application/octet-stream",
      "X-File-Name": file.name,
      "X-Folder": folder,
    },
    body: file,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Upload failed (${res.status})`);
  }

  const text = await res.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error("Upload response was not valid JSON.");
  }

  if (!data.url || typeof data.url !== 'string' || !data.url.startsWith('http')) {
    throw new Error("Upload response did not include a valid public URL.");
  }

  return data; // { path, url }
}

// Deletes a file from R2 through the Worker, given the path
// returned by uploadToR2 (not the full URL).
async function deleteFromR2(path) {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error("Not signed in");

  const res = await fetch(`${R2_WORKER_URL}/delete`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Delete failed (${res.status})`);
  }
  return res.json();
}

// Resolves a stored value to a displayable URL. Handles both:
// - new entries: a full R2 URL already (starts with http)
// - old entries: a Supabase Storage path from before this migration
function publicUrl(value) {
  if (!value || typeof value !== 'string') return '';
  if (value.startsWith('http')) return value;
  return sb.storage.from('media').getPublicUrl(value).data.publicUrl;
}

// Deletes whatever is stored in a *_path column, whether it's a
// new R2 URL or a legacy Supabase Storage path. Use this instead
// of calling deleteFromR2 or sb.storage.remove directly.
async function deleteMediaFile(value) {
  if (!value) return;
  if (value.startsWith(R2_PUBLIC_BASE_URL)) {
    const path = value.replace(R2_PUBLIC_BASE_URL + '/', '');
    await deleteFromR2(path);
  } else if (!value.startsWith('http')) {
    await sb.storage.from('media').remove([value]);
  }
  // else: an unrecognized full URL (rare) — nothing to clean up
}
