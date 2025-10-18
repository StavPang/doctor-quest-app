# Deploying DoctorQuest to Vercel

This guide will walk you through deploying your DoctorQuest application to Vercel.

## Prerequisites

- A GitHub account (recommended) or you can deploy directly
- A Vercel account (free tier available at https://vercel.com)
- Your Supabase credentials

## Method 1: Deploy via GitHub (Recommended)

### Step 1: Create a Git Repository

1. **Initialize Git in your project** (if not already done):
   ```bash
   cd doctor-quest-app
   git init
   git add .
   git commit -m "Initial commit: DoctorQuest app"
   ```

2. **Create a new repository on GitHub**:
   - Go to https://github.com/new
   - Name it `doctor-quest-app`
   - Don't initialize with README (you already have files)
   - Click "Create repository"

3. **Push your code to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/doctor-quest-app.git
   git branch -M main
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` with your actual GitHub username)

### Step 2: Deploy to Vercel

1. **Go to Vercel**:
   - Visit https://vercel.com
   - Click "Sign Up" or "Log In"
   - Sign in with your GitHub account

2. **Import your project**:
   - Click "Add New" → "Project"
   - Find and select your `doctor-quest-app` repository
   - Click "Import"

3. **Configure your project**:
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. **Add Environment Variables**:
   Click "Environment Variables" and add:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://bdafkfqmrbgtyovwsliy.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkYWZrZnFtcmJndHlvdndzbGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NjQ5MzEsImV4cCI6MjA3NjM0MDkzMX0.mhazWtMGzuDc91V3yHCVe-DCNxM6-Ydjqa2S69KtluQ` |

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for the build to complete
   - Your app will be live at: `https://doctor-quest-app-YOUR_USERNAME.vercel.app`

---

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 3: Deploy

1. **Navigate to your project**:
   ```bash
   cd doctor-quest-app
   ```

2. **Run the deploy command**:
   ```bash
   vercel
   ```

3. **Answer the setup questions**:
   - Set up and deploy?: **Y**
   - Which scope?: Select your account
   - Link to existing project?: **N**
   - Project name: **doctor-quest-app**
   - Directory: **./` (press Enter)
   - Override settings?: **N**

4. **Add environment variables**:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   ```
   Enter value: `https://bdafkfqmrbgtyovwsliy.supabase.co`

   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
   Enter value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkYWZrZnFtcmJndHlvdndzbGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NjQ5MzEsImV4cCI6MjA3NjM0MDkzMX0.mhazWtMGzuDc91V3yHCVe-DCNxM6-Ydjqa2S69KtluQ`

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

---

## Method 3: Deploy via Vercel Dashboard (No Git)

1. **Build your project locally**:
   ```bash
   cd doctor-quest-app
   npm run build
   ```

2. **Go to Vercel Dashboard**:
   - Visit https://vercel.com/dashboard
   - Click "Add New" → "Project"
   - Select "Import Third-Party Git Repository" or upload directly

3. **Drag and drop or upload**:
   - You can drag and drop your entire `doctor-quest-app` folder
   - Or use the Vercel CLI as described in Method 2

---

## Important: Configure Supabase for Vercel

After deployment, you need to add your Vercel domain to Supabase's allowed origins:

1. **Go to your Supabase Dashboard**:
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Add Vercel URL to allowed origins**:
   - Go to "Settings" → "API"
   - Scroll to "URL Configuration"
   - Add your Vercel domain to the allowed origins:
     - `https://your-app-name.vercel.app`
     - Also add: `https://*.vercel.app` (for preview deployments)

3. **Check RLS Policies**:
   - Go to "Authentication" → "Policies"
   - Ensure your `questions` table has a policy to allow SELECT for anonymous users
   - Example policy:
     ```sql
     CREATE POLICY "Allow public read access" ON questions
     FOR SELECT
     USING (true);
     ```

---

## Post-Deployment

### Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

### Automatic Deployments

If you used Method 1 (GitHub):
- Every push to your `main` branch will automatically deploy to production
- Pull requests create preview deployments

### Monitor Your App

- View logs: Vercel Dashboard → Your Project → "Logs"
- View analytics: Vercel Dashboard → Your Project → "Analytics"
- View build history: Vercel Dashboard → Your Project → "Deployments"

---

## Troubleshooting

### Build Errors

If your build fails:
1. Check the build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Test the build locally: `npm run build`

### Environment Variables Not Working

- Make sure environment variables are prefixed with `NEXT_PUBLIC_`
- Redeploy after adding environment variables
- Check they're set for "Production" environment

### Supabase Connection Issues

- Verify Supabase URL and key are correct
- Check Supabase project is not paused
- Ensure RLS policies allow public read access
- Add Vercel domain to Supabase allowed origins

### Database Not Loading

- Check browser console for errors (F12)
- Verify Supabase table `questions` exists and has data
- Test Supabase connection locally first

---

## Useful Commands

```bash
# View deployment info
vercel inspect

# List all deployments
vercel list

# View logs
vercel logs

# Remove a deployment
vercel remove [deployment-url]

# Open project in browser
vercel open
```

---

## Summary

**Fastest Method**: Method 1 (GitHub + Vercel Dashboard)
- Takes ~5 minutes
- Automatic deployments on git push
- Easy rollbacks
- Preview deployments for branches

**Your app will be live at**: `https://[your-project-name].vercel.app`

Enjoy your deployed DoctorQuest app! 🚀
