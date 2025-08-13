// app/api/plants/route.ts
import { pool } from '@/app/config/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  try {
    const client = await pool.connect();
    const res = await client.query(
      'SELECT * FROM plants WHERE name ILIKE $1 OR id::text LIKE $1',
      [`%${query}%`]
    );
    client.release();
    return NextResponse.json(res.rows);
  } catch (error) {
    return NextResponse.json(
      { error: 'Database query failed' },
      { status: 500 }
    );
  }
}