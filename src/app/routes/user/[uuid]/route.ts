export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
  });
}
import { database } from '@/app/config/firebase';
import { NextResponse } from 'next/server';
import { ref, get, update } from "firebase/database";

// Helper: Await params for Next.js 13+
export async function GET(
  request: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = snapshot.val();
    return NextResponse.json(user);

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
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    const { display_name, photo_url } = await request.json();

    // Update the data in Firebase
    const updates: any = {};
    if (display_name !== undefined) updates.display_name = display_name;
    if (photo_url !== undefined) updates.photo_url = photo_url;

    const userRef = ref(database, `users/${uid}`);

    // apply update if keys exist
    await update(userRef, updates);

    // Get updated user data
    const snapshot = await get(userRef);

    const user = snapshot.exists() ? snapshot.val() : null;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found after update' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
