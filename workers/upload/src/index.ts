interface Env {
  IMAGES_BUCKET: R2Bucket;
  ALLOWED_ORIGIN: string;
  R2_PUBLIC_URL: string;
}

function corsHeaders(origin: string, allowedOrigin: string): HeadersInit {
  const headers: HeadersInit = {
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
  if (origin === allowedOrigin || allowedOrigin === "*") {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function jsonResponse(data: unknown, status: number, cors: HeadersInit): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, env.ALLOWED_ORIGIN);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    // POST /upload — multipart file upload to R2
    if (request.method === "POST" && url.pathname === "/upload") {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return jsonResponse({ error: "No file provided" }, 400, cors);
      }

      // Sanitize filename: keep alphanumeric, dots, hyphens, underscores
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const key = `${safeName}`;

      await env.IMAGES_BUCKET.put(key, file.stream(), {
        httpMetadata: { contentType: file.type },
      });

      return jsonResponse(
        { key, url: `${env.R2_PUBLIC_URL}/${key}` },
        201,
        cors,
      );
    }

    // GET /list — paginated list of objects
    if (request.method === "GET" && url.pathname === "/list") {
      const cursor = url.searchParams.get("cursor") || undefined;
      const prefix = url.searchParams.get("prefix") || undefined;
      const listed = await env.IMAGES_BUCKET.list({
        limit: 100,
        cursor,
        prefix,
      });

      const files = listed.objects.map((obj) => ({
        key: obj.key,
        url: `${env.R2_PUBLIC_URL}/${obj.key}`,
        size: obj.size,
        uploaded: obj.uploaded.toISOString(),
      }));

      return jsonResponse(
        { files, cursor: listed.truncated ? listed.cursor : null },
        200,
        cors,
      );
    }

    // DELETE /delete/:key — remove object from R2
    if (request.method === "DELETE" && url.pathname.startsWith("/delete/")) {
      const key = decodeURIComponent(url.pathname.slice("/delete/".length));
      if (!key) {
        return jsonResponse({ error: "No key provided" }, 400, cors);
      }

      await env.IMAGES_BUCKET.delete(key);
      return jsonResponse({ deleted: key }, 200, cors);
    }

    return jsonResponse({ error: "Not found" }, 404, cors);
  },
};
