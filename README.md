# Plantation Tracker

A Next.js web application that allows users to track and manage their plants with an interactive map, leaderboard, and community features.

## Features

- 🌱 **Plant Tracking**: Add plants with names, descriptions, images, and GPS coordinates
- 🗺️ **Interactive Map**: View all tracked plants on an interactive map using Leaflet
- 🏆 **Leaderboard**: See top users based on the number of plants they've tracked
- 🔍 **Search**: Search through plants by name or ID
- 🔐 **Authentication**: Google OAuth login system using Firebase
- 📊 **Admin Dashboard**: View statistics and analytics about the platform
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Authentication**: Firebase Auth
- **Database**: PostgreSQL with PostGIS extension
- **Maps**: Leaflet with React-Leaflet
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **State Management**: TanStack Query

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+ with PostGIS extension
- Firebase project

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd plantation
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Admin (for server-side operations)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/plantation_db
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=plantation_db
DB_PASSWORD=your_db_password
DB_PORT=5432
```

### 4. Set up the database

1. Create a PostgreSQL database
2. Enable the PostGIS extension:
   ```sql
   CREATE EXTENSION postgis;
   ```
3. Run the schema file:
   ```bash
   psql -d plantation_db -f database/schema.sql
   ```

### 5. Configure Firebase

1. Create a Firebase project
2. Enable Google Authentication
3. Enable Firebase Storage
4. Create a service account and download the credentials
5. Add the credentials to your environment variables

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (main)/          # Main application pages
│   ├── api/             # API routes
│   ├── components/      # Reusable components
│   ├── config/          # Configuration files
│   └── context/         # React contexts
├── components/          # UI components
└── lib/                 # Utility functions and types
```

## API Endpoints

- `GET /api/plants` - Get all plants (with optional search and user filtering)
- `POST /api/plants` - Create a new plant
- `GET /api/user/[uuid]` - Get user data
- `PUT /api/user/[uuid]` - Update user data
- `GET /api/leaderboard` - Get leaderboard data
- `GET /api/admin/stats` - Get admin statistics
- `GET /api/admin/chart` - Get chart data
- `GET /api/search` - Search plants

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
