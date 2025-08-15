// app/api/plants/route.ts
import { pool } from '@/app/config/db';
import { NextResponse } from 'next/server';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/app/config/firebase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const userId = searchParams.get('userId');

    // Temporary mock data until database is set up
    const mockPlants = [
      {
        id: 1,
        name: 'Monstera Deliciosa',
        description: 'A beautiful Swiss cheese plant',
        image_url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400',
        lat: 40.7128,
        lng: -74.0060,
        user_id: 'mock-user-id',
        user_name: 'Test User',
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Fiddle Leaf Fig',
        description: 'Popular indoor tree plant',
        image_url: 'https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400',
        lat: 34.0522,
        lng: -118.2437,
        user_id: 'mock-user-id',
        user_name: 'Test User',
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: 3,
        name: 'Snake Plant',
        description: 'Low maintenance air purifier',
        image_url: 'https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400',
        lat: 41.8781,
        lng: -87.6298,
        user_id: 'mock-user-id',
        user_name: 'Test User',
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
    ];

    // Filter by userId if provided
    if (userId) {
      return NextResponse.json(mockPlants.filter(plant => plant.user_id === 'mock-user-id'));
    }

    // Filter by query if provided
    if (query) {
      const filteredPlants = mockPlants.filter(plant => 
        plant.name.toLowerCase().includes(query.toLowerCase()) ||
        plant.id.toString().includes(query)
      );
      return NextResponse.json(filteredPlants);
    }

    return NextResponse.json(mockPlants);
    
    // Uncomment this when database is ready:
    /*
    const client = await pool.connect();
    
    let query = `
      SELECT 
        p.id, p.name, p.description, p.image_url,
        ST_X(p.location) as lng, ST_Y(p.location) as lat,
        p.user_id, p.user_name, p.created_at
      FROM plants p
    `;
    
    const params: any[] = [];
    let paramCount = 0;
    
    if (searchParams.get('userId')) {
      paramCount++;
      query += ` WHERE p.user_id = $${paramCount}`;
      params.push(searchParams.get('userId'));
    }
    
    if (searchParams.get('q')) {
      paramCount++;
      const whereClause = paramCount === 1 ? ' WHERE' : ' AND';
      query += `${whereClause} (p.name ILIKE $${paramCount} OR p.id::text LIKE $${paramCount})`;
      params.push(`%${searchParams.get('q')}%`);
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const res = await client.query(query, params);
    client.release();
    
    return NextResponse.json(res.rows);
    */
  } catch (error) {
    console.error('Error fetching plants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plants' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const image = formData.get('image') as File;
    const lat = parseFloat(formData.get('lat') as string);
    const lng = parseFloat(formData.get('lng') as string);
    const userId = formData.get('userId') as string;
    const userName = formData.get('userName') as string;

    if (!name || !userId || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Temporary mock response
    const mockPlant = {
      id: Math.floor(Math.random() * 1000) + 3,
      name,
      description: description || '',
      image_url: image ? 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400' : null,
      lat,
      lng,
      user_id: userId,
      user_name: userName,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(mockPlant);
    
    // Uncomment this when database is ready:
    /*
    const client = await pool.connect();

    // Check if user exists, if not create them
    let userRes = await client.query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [userId]
    );

    let dbUserId: string;
    if (userRes.rows.length === 0) {
      // Create user if doesn't exist
      const newUserRes = await client.query(
        'INSERT INTO users (firebase_uid, email, display_name) VALUES ($1, $2, $3) RETURNING id',
        [userId, `${userId}@example.com`, userName]
      );
      dbUserId = newUserRes.rows[0].id;
    } else {
      dbUserId = userRes.rows[0].id;
    }

    // Upload image if provided
    let imageUrl = null;
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const imageRef = ref(storage, `plants/${Date.now()}_${image.name}`);
      await uploadBytes(imageRef, buffer);
      imageUrl = await getDownloadURL(imageRef);
    }

    // Insert plant with location
    const plantRes = await client.query(
      `INSERT INTO plants (name, description, image_url, location, user_id, user_name)
       VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6, $7)
       RETURNING *`,
      [name, description, imageUrl, lng, lat, dbUserId, userName]
    );

    client.release();

    return NextResponse.json(plantRes.rows[0]);
    */
  } catch (error) {
    console.error('Error creating plant:', error);
    return NextResponse.json(
      { error: 'Failed to create plant' },
      { status: 500 }
    );
  }
}