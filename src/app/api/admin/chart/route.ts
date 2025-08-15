import { pool } from '@/app/config/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Temporary mock data until database is set up
    const mockChartData = [
      { week: '2024-01-01', plants: 5 },
      { week: '2024-01-08', plants: 8 },
      { week: '2024-01-15', plants: 12 },
      { week: '2024-01-22', plants: 15 },
      { week: '2024-01-29', plants: 18 },
      { week: '2024-02-05', plants: 22 },
      { week: '2024-02-12', plants: 25 },
      { week: '2024-02-19', plants: 28 },
      { week: '2024-02-26', plants: 32 },
      { week: '2024-03-04', plants: 35 },
      { week: '2024-03-11', plants: 38 },
      { week: '2024-03-18', plants: 45 },
    ];

    const chartData = mockChartData.map(row => ({
      week: new Date(row.week).toLocaleDateString(),
      plants: row.plants,
    }));

    return NextResponse.json(chartData);
    
    // Uncomment this when database is ready:
    /*
    const client = await pool.connect();

    // Get weekly data for chart
    const chartRes = await client.query(`
      SELECT
        DATE_TRUNC('week', created_at) as week,
        COUNT(*) as plant_count
      FROM plants
      GROUP BY week
      ORDER BY week
      LIMIT 12
    `);

    client.release();

    const chartData = chartRes.rows.map(row => ({
      week: new Date(row.week).toLocaleDateString(),
      plants: parseInt(row.plant_count),
    }));

    return NextResponse.json(chartData);
    */
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}
