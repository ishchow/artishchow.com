interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  ALLOWED_ORIGIN: string;
}

// Decap CMS GitHub OAuth proxy for Cloudflare Workers.
// Implements the OAuth flow that Decap CMS expects:
//   1. GET /auth  → redirects user to GitHub OAuth authorize URL
//   2. GET /callback → exchanges code for token, posts token back to Decap CMS via postMessage

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Step 1: Redirect to GitHub OAuth
    if (url.pathname === "/auth") {
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: `${url.origin}/callback`,
        scope: "repo,user",
        state: crypto.randomUUID(),
      });
      return Response.redirect(
        `https://github.com/login/oauth/authorize?${params}`,
        302,
      );
    }

    // Step 2: Exchange code for token, send back to Decap CMS
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response("Missing code parameter", { status: 400 });
      }

      const tokenResponse = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
          }),
        },
      );

      const tokenData = (await tokenResponse.json()) as {
        access_token?: string;
        error?: string;
      };

      if (tokenData.error || !tokenData.access_token) {
        return new Response(
          `OAuth error: ${tokenData.error || "no access_token"}`,
          { status: 400 },
        );
      }

      // Decap CMS expects the token delivered via postMessage from a popup window
      const script = `
        <script>
          (function() {
            function sendMessage(provider, token) {
              var msg = "authorization:" + provider + ":success:" + JSON.stringify({token: token, provider: provider});
              window.opener.postMessage(msg, "${env.ALLOWED_ORIGIN}");
              setTimeout(function() { window.close(); }, 100);
            }
            sendMessage("github", "${tokenData.access_token}");
          })();
        </script>`;

      return new Response(script, {
        headers: { "Content-Type": "text/html;charset=utf-8" },
      });
    }

    return new Response("Not found", { status: 404 });
  },
};
