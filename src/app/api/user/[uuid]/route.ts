// app/api/user/[uid]/route.ts
import { pool } from '@/app/config/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = params;
    const client = await pool.connect();
    const res = await client.query('SELECT name FROM users WHERE uid = $1', [uid]);
    client.release();
    
    return NextResponse.json(res.rows[0]?.name || null);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}