import { pool } from '@/app/config/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Temporary mock data until database is set up
    const mockStats = {
      total_plants: 45,
      total_users: 12,
      recent_plants: 8,
    };

    return NextResponse.json(mockStats);
    
    // Uncomment this when database is ready:
    /*
    const client = await pool.connect();

    // Get total stats
    const statsRes = await client.query(`
      SELECT
        COUNT(*) as total_plants,
        COUNT(DISTINCT user_id) as total_users,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as recent_plants
      FROM plants
    `);

    client.release();

    return NextResponse.json(statsRes.rows[0]);
    */
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
