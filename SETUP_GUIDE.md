# 🌱 Plantation Tracker - Setup Guide

## Complete Setup Instructions for Firebase Realtime Database

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Git

---

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `plantation-tracker` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 1.2 Enable Authentication
1. In Firebase Console, go to "Authentication" → "Get started"
2. Click "Sign-in method" tab
3. Enable "Google" provider:
   - Click "Google" → "Enable"
   - Add your authorized domain (localhost for development)
   - Save

### 1.3 Enable Realtime Database
1. Go to "Realtime Database" → "Create database"
2. Choose "Start in test mode" (for development)
3. Select a location (choose closest to your region)
4. Click "Done"

### 1.4 Enable Storage
1. Go to "Storage" → "Get started"
2. Choose "Start in test mode" (for development)
3. Select a location (same as database)
4. Click "Done"

### 1.5 Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" → "Web"
4. Register app with name: `plantation-tracker-web`
5. Copy the configuration object

---

## Step 2: Environment Configuration

### 2.1 Create Environment File
Create `.env.local` in your project root:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com

# Firebase Admin (for server-side operations)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key_here"
```

### 2.2 Get Firebase Admin SDK
1. In Firebase Console, go to Project Settings
2. Click "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Extract the values and add to your `.env.local`

---

## Step 3: Database Rules Configuration

### 3.1 Realtime Database Rules
In Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    "plants": {
      ".read": true,
      ".write": "auth != null",
      "$plantId": {
        ".validate": "newData.hasChildren(['name', 'user_id', 'user_name', 'lat', 'lng', 'created_at'])",
        "name": {
          ".validate": "newData.isString() && newData.val().length >= 2"
        },
        "user_id": {
          ".validate": "newData.isString() && newData.val() == auth.uid"
        },
        "lat": {
          ".validate": "newData.isNumber() && newData.val() >= 29.2 && newData.val() <= 29.6"
        },
        "lng": {
          ".validate": "newData.isNumber() && newData.val() >= 76.7 && newData.val() <= 77.2"
        }
      }
    },
    "users": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $userId"
      }
    }
  }
}
```

### 3.2 Storage Rules
In Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /plants/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
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
3. Try adding a plant in Panipat area
4. Check if it appears on the map

---

## Step 5: Production Deployment

### 5.1 Update Database Rules for Production
Update the Realtime Database rules to be more restrictive:

```json
{
  "rules": {
    "plants": {
      ".read": true,
      ".write": "auth != null",
      "$plantId": {
        ".validate": "newData.hasChildren(['name', 'user_id', 'user_name', 'lat', 'lng', 'created_at'])",
        "name": {
          ".validate": "newData.isString() && newData.val().length >= 2"
        },
        "user_id": {
          ".validate": "newData.isString() && newData.val() == auth.uid"
        },
        "lat": {
          ".validate": "newData.isNumber() && newData.val() >= 29.2 && newData.val() <= 29.6"
        },
        "lng": {
          ".validate": "newData.isNumber() && newData.val() >= 76.7 && newData.val() <= 77.2"
        }
      }
    }
  }
}
```

### 5.2 Deploy to Vercel/Netlify
1. Push your code to GitHub
2. Connect to Vercel/Netlify
3. Add environment variables in deployment platform
4. Deploy

---

## Step 6: What You Need to Do

### ✅ Automatic (Already Done)
- [x] Firebase configuration setup
- [x] Realtime Database integration
- [x] Storage integration
- [x] Authentication setup
- [x] Map restrictions to Panipat area
- [x] Search functionality with debouncing
- [x] Form validation for Panipat bounds

### 🔧 Manual Steps Required
1. **Create Firebase Project** (Step 1.1)
2. **Enable Services** (Steps 1.2-1.4)
3. **Get Configuration** (Step 1.5)
4. **Create .env.local** (Step 2.1)
5. **Set Database Rules** (Step 3.1)
6. **Set Storage Rules** (Step 3.2)
7. **Test Application** (Step 4.3)

### 📝 Important Notes
- **Map Restrictions**: The map is now restricted to Panipat, Haryana area (29.2°-29.6°N, 76.7°-77.2°E)
- **Location Validation**: Plants can only be added within Panipat bounds
- **Real-time Updates**: All data is stored in Firebase Realtime Database
- **Image Storage**: Plant images are stored in Firebase Storage
- **Authentication**: Google Sign-in is required to add plants

### 🚨 Security Considerations
- Update database rules for production
- Add proper CORS settings
- Implement rate limiting
- Add input sanitization
- Set up proper error handling

---

## Troubleshooting

### Common Issues
1. **Firebase not initialized**: Check your `.env.local` file
2. **Authentication errors**: Verify Google provider is enabled
3. **Database permission denied**: Check database rules
4. **Storage upload failed**: Check storage rules
5. **Map not loading**: Check if Leaflet CSS is loaded

### Debug Commands
```bash
# Check environment variables
npm run dev

# Check Firebase connection
# Look for console logs in browser dev tools

# Test database connection
# Try adding a plant and check Firebase console
```

---

## Support
If you encounter any issues:
1. Check Firebase Console for errors
2. Verify environment variables
3. Check browser console for JavaScript errors
4. Ensure all Firebase services are enabled

The application is now fully configured to work with Firebase Realtime Database and restricted to Panipat, Haryana area! 🌱
