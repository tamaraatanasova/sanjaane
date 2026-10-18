const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_FILE_SIZE = 30 * 1024 * 1024;

async function getAccessToken() {
  const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET');
  const refreshToken = Deno.env.get('GOOGLE_OAUTH_REFRESH_TOKEN');
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Google OAuth is not configured. Add GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and GOOGLE_OAUTH_REFRESH_TOKEN.');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description ?? data.error ?? 'Google OAuth token refresh failed.');
  }
  return data.access_token as string;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed.' }, { status: 405, headers: corsHeaders });

  try {
    const folderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID');
    if (!folderId) throw new Error('Google Drive upload is not configured. Add GOOGLE_DRIVE_FOLDER_ID.');

    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File) || (!file.type.startsWith('image/') && !file.type.startsWith('video/'))) {
      return Response.json({ error: 'Please upload an image or video.' }, { status: 400, headers: corsHeaders });
    }
    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: 'The file is larger than 30 MB.' }, { status: 413, headers: corsHeaders });
    }

    const token = await getAccessToken();
    const boundary = `drive-upload-${crypto.randomUUID()}`;
    const metadata = JSON.stringify({ name: file.name, parents: [folderId] });
    const body = new Blob([
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
      `--${boundary}\r\nContent-Type: ${file.type}\r\n\r\n`,
      await file.arrayBuffer(),
      `\r\n--${boundary}--`,
    ]);
    const upload = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
    });
    const data = await upload.json();
    if (!upload.ok) throw new Error(data.error?.message ?? 'Google Drive upload failed.');

    return Response.json(data, { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error instanceof Error ? error.message : 'Upload failed.' }, { status: 500, headers: corsHeaders });
  }
});
