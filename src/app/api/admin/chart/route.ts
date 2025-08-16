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

function getWeekStart(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const plantsRef = dbRef(database, 'plants');
    const snapshot = await get(plantsRef);
    const weekly: Record<string, number> = {};

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const plant = childSnapshot.val();
        if (plant.created_at) {
          const week = getWeekStart(new Date(plant.created_at));
          weekly[week] = (weekly[week] || 0) + 1;
        }
      });
    }

    // Sort by week and format for chart
    const chartData = Object.entries(weekly)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([week, plants]) => ({
        week: new Date(week).toLocaleDateString(),
        plants,
      }));

    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}
