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
import { getSupabaseServerClient } from '@/app/config/supabase-server';

function getWeekStart(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Get all plants with creation dates
    const { data: plants, error } = await supabase
      .from('plants')
      .select('created_at');

    if (error) {
      console.error('Error fetching plants for chart:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chart data' },
        { status: 500 }
      );
    }

    const weekly: Record<string, number> = {};

    plants?.forEach((plant) => {
      if (plant.created_at) {
        const week = getWeekStart(new Date(plant.created_at));
        weekly[week] = (weekly[week] || 0) + 1;
      }
    });

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
