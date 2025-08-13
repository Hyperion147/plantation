// app/api/search/route.ts
import { pool } from '@/app/config/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json([]);
  }

  const client = await pool.connect();
  try {
    const res = await client.query(
      'SELECT * FROM plants WHERE name ILIKE $1 OR id::text LIKE $1',
      [`%${query}%`]
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plants' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}