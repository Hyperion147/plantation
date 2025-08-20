# 🔄 Firebase to Supabase Migration Guide

This guide documents the complete migration from Firebase to Supabase for the Plantation Tracker application.

## What Was Changed

### 1. Authentication
- **Before**: Firebase Auth with Google OAuth
- **After**: Supabase Auth with Google OAuth
- **Changes**:
  - Updated `AuthContext.tsx` to use Supabase auth
  - Modified `GoogleLoginButton.tsx` for Supabase OAuth
  - Added auth callback route for Supabase

### 2. Database
- **Before**: Firebase Realtime Database
- **After**: Supabase PostgreSQL with PostGIS
- **Changes**:
  - Created new database schema (`database/supabase-schema.sql`)
  - Updated all API routes to use Supabase client
  - Implemented Row Level Security (RLS) policies
  - Added proper indexes and triggers

### 3. Storage
- **Before**: Firebase Storage
- **After**: Supabase Storage
- **Changes**:
  - Updated image upload logic in plants API
  - Configured storage policies for security
  - Maintained same file structure and naming

### 4. Configuration
- **Before**: Firebase config files
- **After**: Supabase config files
- **Changes**:
  - Replaced `firebase.ts` with `supabase.ts`
  - Removed `firebase-admin.ts`
  - Updated environment variables

## Files Modified

### New Files Created
- `src/app/config/supabase.ts` - Supabase client configuration
- `database/supabase-schema.sql` - Database schema for Supabase
- `src/app/auth/callback/route.ts` - OAuth callback handler
- `MIGRATION_GUIDE.md` - This migration guide

### Files Updated
- `src/app/context/AuthContext.tsx` - Converted to Supabase auth
- `src/app/components/auth/GoogleLoginButton.tsx` - Updated for Supabase OAuth
- `src/app/components/Navigation.tsx` - Updated for Supabase auth
- `src/app/api/plants/route.ts` - Converted to Supabase database and storage
- `src/app/api/search/route.ts` - Updated for Supabase search
- `src/app/api/leaderboard/route.ts` - Updated for Supabase database
- `src/app/api/admin/stats/route.ts` - Updated for Supabase database
- `src/app/api/admin/chart/route.ts` - Updated for Supabase database
- `src/app/api/user/[uuid]/route.ts` - Updated for Supabase database
- `scripts/setup.js` - Updated for Supabase configuration
- `README.md` - Updated documentation
- `SETUP_GUIDE.md` - Updated setup instructions

### Files Deleted
- `src/app/config/firebase.ts` - Replaced by supabase.ts
- `src/app/config/firebase-admin.ts` - No longer needed

## Dependencies Changed

### Removed
```json
{
  "firebase": "^12.1.0",
  "firebase-admin": "^12.7.0"
}
```

### Added
```json
{
  "@supabase/supabase-js": "^2.x.x",
  "@supabase/ssr": "^x.x.x"
}
```

## Environment Variables

### Removed (Firebase)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### Added (Supabase)
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Database Schema Changes

### Before (Firebase Realtime Database)
- NoSQL structure with nested objects
- No schema validation
- No relationships
- No indexes

### After (Supabase PostgreSQL)
```sql
-- Plants table with proper schema
CREATE TABLE plants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security Improvements

### Row Level Security (RLS)
- Plants are viewable by everyone
- Users can only insert/update/delete their own plants
- Users can only access their own profile data

### Storage Policies
- Public read access to plant images
- Authenticated users can upload images
- Users can only modify their own images

## Migration Steps for Existing Data

If you have existing Firebase data to migrate:

1. **Export Firebase Data**
   ```bash
   # Use Firebase Admin SDK to export data
   # Or use Firebase Console to export JSON
   ```

2. **Transform Data**
   ```javascript
   // Convert Firebase data to match Supabase schema
   const transformPlant = (firebasePlant) => ({
     name: firebasePlant.name,
     description: firebasePlant.description || '',
     user_id: firebasePlant.user_id,
     user_name: firebasePlant.user_name,
     lat: firebasePlant.lat,
     lng: firebasePlant.lng,
     image_url: firebasePlant.image_url,
     created_at: firebasePlant.created_at,
     updated_at: firebasePlant.updated_at || firebasePlant.created_at
   });
   ```

3. **Import to Supabase**
   ```sql
   -- Use Supabase SQL editor or pgAdmin
   INSERT INTO plants (name, description, user_id, user_name, lat, lng, image_url, created_at, updated_at)
   VALUES (...);
   ```

4. **Migrate Images**
   - Download images from Firebase Storage
   - Upload to Supabase Storage with same naming convention

## Testing Checklist

After migration, test the following:

- [ ] User authentication with Google OAuth
- [ ] Plant creation with image upload
- [ ] Plant listing and search
- [ ] Leaderboard functionality
- [ ] Admin statistics and charts
- [ ] User profile management
- [ ] Map display with plant markers
- [ ] Image display from Supabase Storage

## Benefits of Migration

1. **Better Performance**: PostgreSQL with proper indexes
2. **SQL Power**: Full SQL capabilities and relationships
3. **Better Security**: Row Level Security policies
4. **Cost Effective**: Supabase free tier is more generous
5. **Open Source**: PostgreSQL is open source
6. **Better Tooling**: SQL editor, database browser, etc.

## Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check Google OAuth configuration in Supabase
   - Verify redirect URLs match exactly

2. **Database connection errors**
   - Verify Supabase URL and keys
   - Check if schema was applied correctly

3. **Image upload failures**
   - Ensure storage bucket "plants" exists
   - Check storage policies are configured

4. **RLS policy errors**
   - Verify user is authenticated
   - Check policy conditions match your data

## Support

For migration issues:
- Check Supabase documentation: https://supabase.com/docs
- Review the updated setup guide: `SETUP_GUIDE.md`
- Check the project's GitHub issues

---

**Migration completed successfully! 🎉**

The application now uses Supabase for all backend services while maintaining the same functionality and user experience.
