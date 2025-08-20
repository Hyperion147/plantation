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
import { Plant } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryParam = searchParams.get('q');

  if (!queryParam) {
    return NextResponse.json([]);
  }

  try {
    const supabase = await getSupabaseServerClient();
    
    // Use Supabase's full-text search capabilities
    let plants: Plant[] = [];
    let error = null;
    if (!isNaN(Number(queryParam))) {
      // Search by PID
      const { data: pidData, error: pidError } = await supabase
        .from('plants')
        .select('*')
        .eq('pid', queryParam);
      if (pidError) error = pidError;
      if (pidData) plants = plants.concat(pidData);

      // Also search by name/description/user_name
      const { data: otherData, error: otherError } = await supabase
        .from('plants')
        .select('*')
        .or(`name.ilike.%${queryParam}%,description.ilike.%${queryParam}%,user_name.ilike.%${queryParam}%`);
      if (otherError) error = otherError;
      if (otherData) {
        // Avoid duplicates
        const existingPids = new Set(plants.map(p => p.id));
        plants = plants.concat(otherData.filter(p => !existingPids.has(p.id)));
      }
    } else {
      const { data: otherData, error: otherError } = await supabase
        .from('plants')
        .select('*')
        .or(`name.ilike.%${queryParam}%,description.ilike.%${queryParam}%,user_name.ilike.%${queryParam}%`);
      if (otherError) error = otherError;
      if (otherData) plants = otherData;
    }
    // Sort by created_at
    plants = plants.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (error) {
      console.error('Error searching plants:', error);
      return NextResponse.json(
        { error: 'Failed to search plants' },
        { status: 500 }
      );
    }

    // Sort by relevance (exact name matches first, then partial matches, then by date)
    const sortedPlants = (plants || []).sort((a, b) => {
      const queryLower = queryParam.toLowerCase();
      const aNameExact = a.name.toLowerCase() === queryLower;
      const bNameExact = b.name.toLowerCase() === queryLower;
      
      if (aNameExact && !bNameExact) return -1;
      if (!aNameExact && bNameExact) return 1;
      
      const aNameStarts = a.name.toLowerCase().startsWith(queryLower);
      const bNameStarts = b.name.toLowerCase().startsWith(queryLower);
      
      if (aNameStarts && !bNameStarts) return -1;
      if (!aNameStarts && bNameStarts) return 1;
      
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return NextResponse.json(sortedPlants);
  } catch (error) {
    console.error('Error in search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}