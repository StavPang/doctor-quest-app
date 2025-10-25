# Supabase Authentication & Score Tracking Setup

This guide will help you set up Google authentication and user score tracking.

## Part 1: Enable Google Authentication in Supabase

### Step 1: Get Google OAuth Credentials

1. **Go to Google Cloud Console**:
   - Visit https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "DoctorQuest"

4. **Add Authorized redirect URIs**:
   - Get your Supabase callback URL:
     - Go to your Supabase Dashboard
     - Settings → API → URL (something like: `https://bdafkfqmrbgtyovwsliy.supabase.co`)
   - Add this redirect URI in Google Console:
     ```
     https://bdafkfqmrbgtyovwsliy.supabase.co/auth/v1/callback
     ```

5. **Copy credentials**:
   - Copy the "Client ID"
   - Copy the "Client Secret"

### Step 2: Configure Supabase Authentication

1. **Go to Supabase Dashboard**:
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Enable Google Provider**:
   - Go to "Authentication" → "Providers"
   - Find "Google" in the list
   - Toggle it to "Enabled"
   - Paste your Google Client ID
   - Paste your Google Client Secret
   - Click "Save"

3. **Configure Site URL**:
   - Go to "Authentication" → "URL Configuration"
   - Set "Site URL" to your app URL:
     - Development: `http://localhost:3000`
     - Production: `https://your-app.vercel.app`
   - Add to "Redirect URLs":
     - Development: `http://localhost:3000`
     - Production: `https://your-app.vercel.app`

---

## Part 2: Create Database Tables

### Run this SQL in Supabase SQL Editor:

Go to Supabase Dashboard → SQL Editor → New Query, then paste and run:

```sql
-- Create user_scores table to track user quiz performance
CREATE TABLE IF NOT EXISTS user_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes for better performance
  CONSTRAINT unique_user_question UNIQUE(user_id, question_id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_scores_user_id ON user_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_scores_subject ON user_scores(subject);
CREATE INDEX IF NOT EXISTS idx_user_scores_created_at ON user_scores(created_at);

-- Create user_stats table for aggregated statistics
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_questions_answered INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user_stats
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Policies for user_scores table
-- Users can only read their own scores
CREATE POLICY "Users can view their own scores"
  ON user_scores FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own scores
CREATE POLICY "Users can insert their own scores"
  ON user_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own scores
CREATE POLICY "Users can update their own scores"
  ON user_scores FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for user_stats table
-- Users can only read their own stats
CREATE POLICY "Users can view their own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own stats
CREATE POLICY "Users can insert their own stats"
  ON user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own stats
CREATE POLICY "Users can update their own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to automatically create user_stats on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user_stats when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update user stats when a score is added
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user_stats
  INSERT INTO public.user_stats (
    user_id,
    total_questions_answered,
    total_correct_answers,
    last_answered_at,
    updated_at
  )
  VALUES (
    NEW.user_id,
    1,
    CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_questions_answered = user_stats.total_questions_answered + 1,
    total_correct_answers = user_stats.total_correct_answers + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    last_answered_at = NOW(),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update stats when a score is added
DROP TRIGGER IF EXISTS on_score_added ON user_scores;
CREATE TRIGGER on_score_added
  AFTER INSERT ON user_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_stats();
```

---

## Part 3: Verify Setup

### Check Tables:

Go to Supabase Dashboard → Table Editor:
- You should see `user_scores` table
- You should see `user_stats` table

### Check RLS Policies:

Go to each table → Policies tab:
- Verify policies are created
- Make sure RLS is enabled

---

## Part 4: Update Environment Variables

After you deploy, add your production URL to Google Console:

1. **Google Console**:
   - Add your Vercel URL: `https://your-app.vercel.app`

2. **Supabase**:
   - Update Site URL to your production URL
   - Add production URL to redirect URLs

---

## Testing Authentication

Once everything is set up:

1. Run your app: `npm run dev`
2. Click "Sign in with Google"
3. Authenticate with your Google account
4. Check Supabase Dashboard → Authentication → Users
5. You should see your user listed

---

## Troubleshooting

### Error: "Invalid redirect URI"
- Make sure you added the exact Supabase callback URL to Google Console
- Format: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

### Error: "Email not confirmed"
- Go to Supabase → Authentication → Settings
- Disable "Email confirmations" for testing

### Error: "User not found"
- Check RLS policies are correctly set
- Verify trigger is created

### Scores not saving
- Check browser console for errors
- Verify user is authenticated: `supabase.auth.getUser()`
- Check RLS policies allow INSERT

---

## Database Schema Summary

### `user_scores` Table
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to auth.users)
- `question_id`: TEXT (the question ID)
- `subject`: TEXT (subject category)
- `is_correct`: BOOLEAN (was the answer correct?)
- `created_at`: TIMESTAMP

### `user_stats` Table
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to auth.users)
- `total_questions_answered`: INTEGER
- `total_correct_answers`: INTEGER
- `current_streak`: INTEGER
- `longest_streak`: INTEGER
- `last_answered_at`: TIMESTAMP
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

---

That's it! Your authentication and score tracking should now be fully set up. 🚀
