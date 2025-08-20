// Base user type
export type User = {
  uid: string;
  email: string;
  name: string;
  created_at: Date | string;
};

// Plant type
export type Plant = {
  id: string | number;
  pid: string;
  name: string;
  description?: string;
  image_url?: string | null;
  lat: number;
  lng: number;
  user_id: string;
  user_name: string;
  created_at: string | Date;
  updated_at?: string | Date;
};

// For forms
export type PlantFormData = {
  name: string;
  description?: string;
  image: File | null;
  location: {
    lat: number;
    lng: number;
  } | null;
};

// For API responses
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

// For the leaderboard
export type LeaderboardUser = {
  user_id: string;
  user_name: string;
  plant_count: number;
  rank: number;
};

// For the map component
export type MapBounds = {
  ne: {
    lat: number;
    lng: number;
  };
  sw: {
    lat: number;
    lng: number;
  };
};

// For admin stats
export type AdminStats = {
  total_plants: number;
  total_users: number;
  recent_plants: number;
};

// For weekly plant chart
export type WeeklyPlantData = {
  week: string;
  plants: number;
};