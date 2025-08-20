export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
  });
}

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/config/supabase';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get plants with user information and count by user
    const { data: plants, error } = await supabase
      .from('plants')
      .select('user_id, user_name');

    if (error) {
      console.error('Error fetching plants for leaderboard:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    // Count plants per user
    const leaderboard: Record<string, { user_id: string; user_name: string; plant_count: number }> = {};
    
    plants?.forEach((plant) => {
      if (plant.user_id && plant.user_name) {
        if (!leaderboard[plant.user_id]) {
          leaderboard[plant.user_id] = {
            user_id: plant.user_id,
            user_name: plant.user_name,
            plant_count: 0,
          };
        }
        leaderboard[plant.user_id].plant_count++;
      }
    });

    const sorted = Object.values(leaderboard)
      .sort((a, b) => b.plant_count - a.plant_count)
      .slice(0, 50);

    return NextResponse.json(sorted);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
