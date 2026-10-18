// Open this function URL once in a browser to connect the Google account that
// owns the destination My Drive folder. It redirects to Google consent.
Deno.serve(() => {
  const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID');
  const redirectUri = Deno.env.get('GOOGLE_OAUTH_REDIRECT_URI');
  const state = Deno.env.get('GOOGLE_OAUTH_STATE');
  if (!clientId || !redirectUri || !state) {
    return Response.json({ error: 'OAuth is not configured.' }, { status: 500 });
  }

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/drive.file',
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  }).toString();
  return Response.redirect(url, 302);
});
