import { pool } from '@/app/config/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Temporary mock data until database is set up
    const mockLeaderboard = [
      {
        user_id: 'user-1',
        user_name: 'Plant Lover',
        plant_count: 15,
      },
      {
        user_id: 'user-2',
        user_name: 'Green Thumb',
        plant_count: 12,
      },
      {
        user_id: 'user-3',
        user_name: 'Botanical Expert',
        plant_count: 8,
      },
      {
        user_id: 'user-4',
        user_name: 'Garden Master',
        plant_count: 6,
      },
      {
        user_id: 'user-5',
        user_name: 'Nature Enthusiast',
        plant_count: 4,
      },
    ];

    return NextResponse.json(mockLeaderboard);
    
    // Uncomment this when database is ready:
    /*
    const client = await pool.connect();
    const res = await client.query(`
      SELECT
        p.user_id,
        p.user_name,
        COUNT(*) as plant_count
      FROM plants p
      GROUP BY p.user_id, p.user_name
      ORDER BY plant_count DESC
      LIMIT 50
    `);
    client.release();

    return NextResponse.json(res.rows);
    */
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
