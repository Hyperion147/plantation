// app/api/search/route.ts
import { NextResponse } from 'next/server';
import { database } from '@/app/config/firebase';
import { ref as dbRef, get, query, orderByChild, startAt, endAt } from 'firebase/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryParam = searchParams.get('q');

  if (!queryParam) {
    return NextResponse.json([]);
  }

  try {
    const plantsRef = dbRef(database, 'plants');
    const plants: any[] = [];

    // First, try to search by name (Firebase supports prefix search)
    const nameQuery = query(plantsRef, orderByChild('name'), startAt(queryParam), endAt(queryParam + '\uf8ff'));
    const nameSnapshot = await get(nameQuery);
    
    if (nameSnapshot.exists()) {
      nameSnapshot.forEach((childSnapshot) => {
        const plant = childSnapshot.val();
        plants.push({
          id: childSnapshot.key,
          ...plant,
        });
      });
    }

    // If no results found by name, search in all plants for description, user_name, and ID
    if (plants.length === 0) {
      const allPlantsSnapshot = await get(plantsRef);
      if (allPlantsSnapshot.exists()) {
        allPlantsSnapshot.forEach((childSnapshot) => {
          const plant = childSnapshot.val();
          const searchTerm = queryParam.toLowerCase();
          
          if (
            plant.description?.toLowerCase().includes(searchTerm) ||
            plant.user_name?.toLowerCase().includes(searchTerm) ||
            childSnapshot.key?.includes(queryParam)
          ) {
            plants.push({
              id: childSnapshot.key,
              ...plant,
            });
          }
        });
      }
    }

    // Sort by relevance (exact name matches first, then partial matches, then by date)
    plants.sort((a, b) => {
      const searchTerm = queryParam.toLowerCase();
      const aNameMatch = a.name.toLowerCase().includes(searchTerm);
      const bNameMatch = b.name.toLowerCase().includes(searchTerm);
      
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return NextResponse.json(plants.slice(0, 20)); // Limit to 20 results
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search plants' },
      { status: 500 }
    );
  }
}