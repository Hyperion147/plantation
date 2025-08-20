import { remove } from 'firebase/database';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const plantId = searchParams.get('id');
    const userId = searchParams.get('userId');
    if (!plantId || !userId) {
      return NextResponse.json(
        { error: 'Missing plantId or userId' },
        { status: 400 }
      );
    }
    const plantRef = dbRef(database, `plants/${plantId}`);
    const snapshot = await get(plantRef);
    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: 'Plant not found' },
        { status: 404 }
      );
    }
    const plant = snapshot.val();
    // Only allow owner or admin to delete
    if (plant.user_id !== userId) {
      // Check if user is admin
      const adminRef = dbRef(database, `admins/${userId}`);
      const adminSnap = await get(adminRef);
      const isAdmin = adminSnap.exists() && !!adminSnap.val();
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Not authorized to delete this plant' },
          { status: 403 }
        );
      }
    }
    // Delete plant
    await remove(plantRef);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting plant:', error);
    return NextResponse.json(
      { error: 'Failed to delete plant' },
      { status: 500 }
    );
  }
}
export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
  });
}
// app/api/plants/route.ts
import { NextResponse } from 'next/server';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, database } from '@/app/config/firebase';
import { ref as dbRef, push, get, query, orderByChild, equalTo, startAt, endAt } from 'firebase/database';
// Correct import for remove is included below with other database imports

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParam = searchParams.get('q');
    const userId = searchParams.get('userId');

    const plantsRef = dbRef(database, 'plants');
    let plantsQuery;

    if (userId) {
      // Filter by userId
      plantsQuery = query(plantsRef, orderByChild('user_id'), equalTo(userId));
    } else if (queryParam) {
      // Search functionality - Firebase doesn't support full-text search
      // We'll implement a simple name-based search
      plantsQuery = query(plantsRef, orderByChild('name'), startAt(queryParam), endAt(queryParam + '\uf8ff'));
    } else {
      // Get all plants
      plantsQuery = query(plantsRef, orderByChild('created_at'));
    }

    const snapshot = await get(plantsQuery);
    const plants: any[] = [];

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const plant = childSnapshot.val();
        plants.push({
          id: childSnapshot.key,
          ...plant,
        });
      });
    }

    // If searching and no results found by name, try description search
    if (queryParam && plants.length === 0) {
      const allPlantsSnapshot = await get(plantsRef);
      if (allPlantsSnapshot.exists()) {
        allPlantsSnapshot.forEach((childSnapshot) => {
          const plant = childSnapshot.val();
          if (
            plant.description?.toLowerCase().includes(queryParam.toLowerCase()) ||
            plant.user_name?.toLowerCase().includes(queryParam.toLowerCase()) ||
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

    // Sort by creation date (newest first)
    plants.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(plants);
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

    // Check if user is admin
    const adminRef = dbRef(database, `admins/${userId}`);
    const adminSnap = await get(adminRef);
    const isAdmin = adminSnap.exists() && !!adminSnap.val();

    // If not admin, check plant count
    if (!isAdmin) {
      const plantsRef = dbRef(database, 'plants');
      const userPlantsQuery = query(plantsRef, orderByChild('user_id'), equalTo(userId));
      const userPlantsSnap = await get(userPlantsQuery);
      let count = 0;
      if (userPlantsSnap.exists()) {
        userPlantsSnap.forEach(() => { count++; });
      }
      if (count >= 5) {
        return NextResponse.json(
          { error: 'You can only register up to 5 plants.' },
          { status: 403 }
        );
      }
    }

    // Upload image if provided
    let imageUrl = null;
    if (image) {
      try {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const imageRef = ref(storage, `plants/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, buffer);
        imageUrl = await getDownloadURL(imageRef);
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        // Continue without image if upload fails
      }
    }

    // Create plant data
    const plantData = {
      name,
      description: description || '',
      image_url: imageUrl,
      lat,
      lng,
      user_id: userId,
      user_name: userName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to Firebase Realtime Database
    const plantsRef = dbRef(database, 'plants');
    const newPlantRef = push(plantsRef, plantData);
    
    const newPlant = {
      id: newPlantRef.key,
      ...plantData,
    };

    return NextResponse.json(newPlant);
  } catch (error) {
    console.error('Error creating plant:', error);
    return NextResponse.json(
      { error: 'Failed to create plant' },
      { status: 500 }
    );
  }
}