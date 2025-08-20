# 🌱 Plantation Tracker - Setup Guide

## Complete Setup Instructions for Supabase

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Git

---

## Step 1: Supabase Project Setup

### 1.1 Create Supabase Project
1. Go to [Supabase Console](https://supabase.com/dashboard)
2. Click "New Project"
3. Enter project name: `plantation-tracker` (or your preferred name)
4. Set a database password
5. Choose a region (closest to your location)
6. Click "Create new project"

### 1.2 Enable Authentication
1. In Supabase Dashboard, go to "Authentication" → "Providers"
2. Enable "Google" provider:
   - Click "Google" → "Enable"
   - Add your Google OAuth credentials (Client ID and Client Secret)
   - Add your authorized redirect URLs (localhost:3000 for development)
   - Save

### 1.3 Set up Storage
1. Go to "Storage" → "Buckets"
2. Click "Create a new bucket"
3. Name it: `plants`
4. Set it as public (for plant images)
5. Click "Create bucket"

### 1.4 Get Supabase Configuration
1. Go to Project Settings (gear icon)
2. Click "API" tab
3. Copy the following values:
   - Project URL
   - Anon public key
   - Service role key (keep this secret)

---

## Step 2: Environment Configuration

### 2.1 Create Environment File
Create `.env.local` in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Database Configuration (if using external PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/plantation_db
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=plantation_db
DB_PASSWORD=your_db_password
DB_PORT=5432
```

---

## Step 3: Database Schema Configuration

### 3.1 Run Database Schema
1. Go to Supabase Dashboard → "SQL Editor"
2. Copy the contents of `database/supabase-schema.sql`
3. Paste and run the SQL in the editor

The schema includes:
- Plants table with PostGIS support
- Users table
- Row Level Security (RLS) policies
- Triggers for automatic timestamps
- User creation trigger

### 3.2 Storage Policies
In Supabase Dashboard → "Storage" → "Policies":

```sql
-- Allow public read access to plant images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'plants');

-- Allow authenticated users to upload plant images
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'plants' AND auth.role() = 'authenticated');

-- Allow users to update their own images
CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE USING (bucket_id = 'plants' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (bucket_id = 'plants' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## Step 4: Application Setup

### 4.1 Install Dependencies
```bash
npm install
```

### 4.2 Run Development Server
```bash
npm run dev
```

### 4.3 Test the Application
1. Open http://localhost:3000
2. Sign in with Google
3. Add a plant with location and image
4. View the map and leaderboard

---

## Step 5: Google OAuth Setup (Optional - for production)

### 5.1 Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)

### 5.2 Configure Supabase with Google OAuth
1. In Supabase Dashboard → "Authentication" → "Providers" → "Google"
2. Add your Google Client ID and Client Secret
3. Add authorized redirect URLs

---

## Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check Google OAuth configuration
   - Verify redirect URLs match exactly
   - Check browser console for errors

2. **Database connection issues**
   - Verify Supabase URL and keys
   - Check if schema was applied correctly
   - Ensure RLS policies are in place

3. **Image upload failures**
   - Verify storage bucket exists and is named "plants"
   - Check storage policies
   - Ensure user is authenticated

4. **CORS errors**
   - Add your domain to Supabase allowed origins
   - Check API routes for proper CORS headers

### Getting Help

- Check Supabase documentation: https://supabase.com/docs
- Review Next.js documentation: https://nextjs.org/docs
- Check the project's GitHub issues

---

## Production Deployment

### Environment Variables
Ensure all environment variables are set in your production environment:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

### Security Considerations
- Never expose the service role key in client-side code
- Use RLS policies to secure your data
- Regularly rotate your API keys
- Monitor your Supabase usage and costs

---

## Migration from Firebase

If you're migrating from Firebase:

1. Export your Firebase data
2. Transform the data to match the new schema
3. Import into Supabase using the SQL editor
4. Update your application code (already done in this migration)
5. Test thoroughly before switching over

---

## Support

For additional support:
- Create an issue on GitHub
- Check the Supabase community forum
- Review the project documentation
