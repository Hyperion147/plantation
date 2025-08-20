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
import { getSupabaseServerClient } from '@/app/config/supabase-server';

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Get all plants
    const { data: plants, error } = await supabase
      .from('plants')
      .select('user_id, created_at');

    if (error) {
      console.error('Error fetching plants for admin stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch admin stats' },
        { status: 500 }
      );
    }

    let total_plants = 0;
    const total_users = new Set();
    let recent_plants = 0;
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    plants?.forEach((plant) => {
      total_plants++;
      if (plant.user_id) total_users.add(plant.user_id);
      if (plant.created_at && new Date(plant.created_at).getTime() >= weekAgo) recent_plants++;
    });

    return NextResponse.json({
      total_plants,
      total_users: total_users.size,
      recent_plants,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
