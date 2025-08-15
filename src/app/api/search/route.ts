// app/api/search/route.ts
import { pool } from '@/app/config/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const client = await pool.connect();
    const res = await client.query(`
      SELECT 
        p.id, p.name, p.description, p.image_url,
        ST_X(p.location) as lng, ST_Y(p.location) as lat,
        p.user_name, p.created_at
      FROM plants p
      WHERE p.name ILIKE $1 OR p.id::text LIKE $1
      ORDER BY p.created_at DESC
      LIMIT 20
    `, [`%${query}%`]);
    
    client.release();
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plants' },
      { status: 500 }
    );
  }
}