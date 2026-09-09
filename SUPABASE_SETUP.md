# Supabase & Vercel Deployment Guide

This guide walks you through connecting your **own Supabase account/project** and deploying live to **Vercel**.

---

## Step 1: Create or Select your Supabase Project

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project** (or select your existing project).
3. Choose your project name (e.g. `hr-technical-assessment`) and set a secure database password.

---

## Step 2: Run the SQL Database Schema

1. In your Supabase Dashboard, go to the left navigation menu and click **SQL Editor**.
2. Click **New Query**.
3. Open the [`supabase_schema.sql`](./supabase_schema.sql) file from this repository and copy all its contents.
4. Paste the SQL script into the Supabase query editor and click **Run**.
5. You will see `Success. No rows returned`. The `candidate_assessments` table and security policies are now ready!

---

## Step 3: Get your API Credentials

In your Supabase Dashboard:
1. Go to **Project Settings** (gear icon) > **API**.
2. Note down:
   - **Project URL** (e.g. `https://your-ref-id.supabase.co`)
   - **anon / public key** (`eyJhbGci...`)

---

## Step 4: Configure the Application

You have two convenient options to connect your Supabase account:

### Option A: From the Portal UI (No code changes needed!)
1. Open the app running locally or in Vercel.
2. Click the **"HR Admin Portal"** button in the top right navbar.
3. Click the **"Supabase Config"** button.
4. Paste your **Project URL** and **anon key**.
5. Click **Test Connection** (it will verify live connectivity with your table).
6. Click **Save & Sync Now**.

### Option B: Using Environment Variables (`.env`)
In your local `.env` file or in your Vercel Project Settings:
```env
VITE_SUPABASE_URL=https://your-ref-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

---

## Step 5: Deploy Live to Vercel

1. Push this project to GitHub / GitLab / Bitbucket, or import the folder directly into [Vercel](https://vercel.com).
2. In the Vercel **New Project** configuration:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Under **Environment Variables**, add:
   - Name: `VITE_SUPABASE_URL` | Value: `https://your-ref-id.supabase.co`
   - Name: `VITE_SUPABASE_ANON_KEY` | Value: `your_supabase_anon_key`
4. Click **Deploy**.
5. Your assessment portal is now live with real-time Supabase cloud synchronization!
