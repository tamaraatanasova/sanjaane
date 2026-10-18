// Google redirects here after consent. It creates the app-owned destination
// folder, then returns the two values that belong in Supabase Secrets.
Deno.serve(async (request) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expectedState = Deno.env.get('GOOGLE_OAUTH_STATE');
  const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET');
  const redirectUri = Deno.env.get('GOOGLE_OAUTH_REDIRECT_URI');

  if (url.searchParams.get('error')) return Response.json({ error: url.searchParams.get('error') }, { status: 400 });
  if (!code || !expectedState || state !== expectedState || !clientId || !clientSecret || !redirectUri) {
    return Response.json({ error: 'Invalid or incomplete OAuth callback.' }, { status: 400 });
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.refresh_token) {
    return Response.json({ error: data.error_description ?? data.error ?? 'Google did not return a refresh token.' }, { status: 400 });
  }
  const folderResponse = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${data.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'SanjaAne',
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });
  const folder = await folderResponse.json();
  if (!folderResponse.ok || !folder.id) {
    return Response.json({ error: folder.error?.message ?? 'Could not create the SanjaAne Drive folder.' }, { status: 400 });
  }
  return Response.json({
    refresh_token: data.refresh_token,
    folder_id: folder.id,
    message: 'Add refresh_token as GOOGLE_OAUTH_REFRESH_TOKEN and folder_id as GOOGLE_DRIVE_FOLDER_ID in Supabase Secrets.',
  });
});
