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

The app is a static Vite build in `client/dist` and talks directly to Supabase.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS 4, react-i18next, React Router
- **Backend:** Supabase Auth, Postgres, Row Level Security
# sanjaane
