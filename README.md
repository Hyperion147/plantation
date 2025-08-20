# Plantation Tracker

A Next.js web application that allows users to track and manage their plants with an interactive map, leaderboard, and community features.

## Features

- 🌱 **Plant Tracking**: Add plants with names, descriptions, images, and GPS coordinates
- 🆔 **Unique Plant IDs**: Each plant gets a unique PID starting from 1001
- 🗺️ **Interactive Map**: View all tracked plants on an interactive map using Leaflet
- 🏆 **Leaderboard**: See top users based on the number of plants they've tracked
- 🔍 **Search**: Search through plants by name or ID
- 🔐 **Authentication**: Google OAuth login system using Supabase
- 📊 **Admin Dashboard**: View statistics and analytics about the platform
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Authentication**: Supabase Auth with Google OAuth
- **Database**: Supabase PostgreSQL with PostGIS extension
- **Storage**: Supabase Storage for plant images
- **Maps**: Leaflet with React-Leaflet
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **State Management**: TanStack Query

## Prerequisites

- Node.js 18+ 
- Supabase account
- Git

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

### 4. Set up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Enable Google OAuth in Authentication settings
3. Create a storage bucket named "plants" in Storage settings
4. Run the database schema:
   ```bash
   # Copy the SQL from database/supabase-schema.sql and run it in your Supabase SQL editor
   ```
   
   **Important**: If you have an existing database without the PID field, run the migration:
   ```bash
   # Copy the SQL from database/migration-add-pid.sql and run it in your Supabase SQL editor
   ```

### 5. Run the development server

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
