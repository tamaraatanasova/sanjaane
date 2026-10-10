# Sanja & Angelcho — Digital Wedding Invitation

A modern, responsive wedding invitation web app with RSVP management, bilingual support (Macedonian & Croatian), and a Supabase-backed admin dashboard.

**Wedding date:** 10 October 2026

## Features

- **Elegant invitation** — Hero page with countdown timer
- **Wedding day details** — Ceremony, reception, schedule, dress code
- **RSVP form** — Guest responses with dietary notes and messages
- **Admin dashboard** — Track attendance, search/filter guests, export CSV
- **Localization** — Full Macedonian (mk) and Croatian (hr) translations
- **Security** — Supabase Auth and Row Level Security policies

## Quick Start

### 1. Install dependencies

```bash
npm install
npm install --prefix client
```

### 2. Configure environment

```bash
cp .env.example client/.env
```

Edit `client/.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For this project, the Supabase project URL is:

```env
VITE_SUPABASE_URL=https://fpdphxphuecijflpgyqy.supabase.co
```

### 3. Set up Supabase

Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor.

Create the admin user in Supabase:

1. Open Supabase Dashboard.
2. Go to `Authentication > Users`.
3. Add a user with email and password.
4. Confirm the user, or enable auto-confirm while testing.

The app signs in with Supabase Auth directly, so users in `public.users` are not used for login.

### 4. Run development server

```bash
npm run dev
```

- **Guest site:** http://localhost:5173
- **Admin panel:** http://localhost:5173/admin/login

## Production Build

```bash
npm run build
npm run preview
```

## Google Drive gallery uploads

The `/poseben-den` gallery sends images and videos to a private Supabase Edge
Function, which then stores them in Google Drive. The browser never receives
the Google service-account key.

Before deploying, share the Drive folder with the service account as **Editor**.
Then, from the project root, authenticate the Supabase CLI and deploy the
function with these two secrets:

```bash
npx supabase login
npx supabase link --project-ref fpdphxphuecijflpgyqy
npx supabase secrets set GOOGLE_DRIVE_FOLDER_ID=1u89ktO9Uee0BfFULeNHx-HVkuPPOhvpj
npx supabase secrets set GOOGLE_SERVICE_ACCOUNT_JSON='PASTE_THE_COMPLETE_SERVICE_ACCOUNT_JSON_HERE'
npx supabase functions deploy upload-to-google-drive
```

Create/download the JSON key in Google Cloud under the service account's
**Keys** section. Keep it private: do not add it to the repository, client
environment variables, or a chat message.

The app is a static Vite build in `client/dist` and talks directly to Supabase.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS 4, react-i18next, React Router
- **Backend:** Supabase Auth, Postgres, Row Level Security
# sanjaane
