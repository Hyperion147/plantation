// app/api/user/[uid]/route.ts
import { pool } from '@/app/config/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { uuid: string } }
) {
  try {
    // Temporary mock data until database is set up
    const mockUser = {
      id: 'mock-user-id',
      firebase_uid: params.uuid,
      email: 'user@example.com',
      display_name: 'Test User',
      photo_url: null,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(mockUser);
    
    // Uncomment this when database is ready:
    /*
    const client = await pool.connect();
    const res = await client.query(
      'SELECT id, firebase_uid, email, display_name, photo_url, created_at FROM users WHERE firebase_uid = $1',
      [params.uuid]
    );
    client.release();

    if (res.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(res.rows[0]);
    */
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { uuid: string } }
) {
  try {
    const { display_name, photo_url } = await request.json();
    
    // Temporary mock response
    const mockUser = {
      id: 'mock-user-id',
      firebase_uid: params.uuid,
      email: 'user@example.com',
      display_name: display_name,
      photo_url: photo_url,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(mockUser);
    
    // Uncomment this when database is ready:
    /*
    const client = await pool.connect();
    
    const res = await client.query(
      'UPDATE users SET display_name = $1, photo_url = $2 WHERE firebase_uid = $3 RETURNING *',
      [display_name, photo_url, params.uuid]
    );
    client.release();

    if (res.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(res.rows[0]);
    */
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}