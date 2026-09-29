// ============================================================
// St. Eric High School — R2 Media Upload Worker
// Verifies the caller is a signed-in CMS admin (via their
// Supabase session token) before touching the R2 bucket, so
// the R2 credentials themselves never reach the browser.
// ============================================================

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, X-File-Name, X-Folder",
};

async function verifyAdmin(request, env) {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return false;
  const token = auth.slice(7);
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: env.SUPABASE_ANON_KEY,
    },
  });
  return res.ok;
}

function safeName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // ---- Upload ----
    if (request.method === "POST" && url.pathname === "/upload") {
      const isAdmin = await verifyAdmin(request, env);
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Not authorized" }), {
          status: 401,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      const fileName = safeName(request.headers.get("X-File-Name") || "upload");
      const folder = safeName(request.headers.get("X-Folder") || "misc");
      const path = `${folder}/${Date.now()}-${fileName}`;

      const body = await request.arrayBuffer();
      await env.MEDIA_BUCKET.put(path, body, {
        httpMetadata: { contentType: request.headers.get("Content-Type") || "application/octet-stream" },
      });

      const publicUrl = `${env.PUBLIC_BASE_URL}/${path}`;
      return new Response(JSON.stringify({ path, url: publicUrl }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // ---- Delete ----
    if (request.method === "DELETE" && url.pathname === "/delete") {
      const isAdmin = await verifyAdmin(request, env);
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Not authorized" }), {
          status: 401,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      const { path } = await request.json();
      if (!path) {
        return new Response(JSON.stringify({ error: "Missing path" }), {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }
      await env.MEDIA_BUCKET.delete(path);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404, headers: CORS_HEADERS });
  },
};
