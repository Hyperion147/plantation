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
import { database } from '@/app/config/firebase';
import { ref as dbRef, get } from 'firebase/database';

export async function GET() {
  try {
    const plantsRef = dbRef(database, 'plants');
    const snapshot = await get(plantsRef);
    let total_plants = 0;
    let total_users = new Set();
    let recent_plants = 0;
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const plant = childSnapshot.val();
        total_plants++;
        if (plant.user_id) total_users.add(plant.user_id);
        if (plant.created_at && new Date(plant.created_at).getTime() >= weekAgo) recent_plants++;
      });
    }

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
