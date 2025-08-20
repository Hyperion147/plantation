export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/app/config/supabase-server';
import { getSupabaseAdminClient } from '@/app/config/supabase-admin';

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
  });
}

export async function DELETE(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Get current session/user from cookies
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const user = session?.user || null;
    const authError = sessionError || null;
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: authError?.message ?? 'No active session' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const plantId = searchParams.get('id');

    if (!plantId) {
      return NextResponse.json(
        { error: 'Missing plantId' },
        { status: 400 }
      );
    }

    // Get the plant to check ownership
    const { data: plant, error: fetchError } = await supabase
      .from('plants')
      .select('*')
      .eq('id', plantId)
      .single();

    if (fetchError || !plant) {
      return NextResponse.json(
        { error: 'Plant not found' },
        { status: 404 }
      );
    }

    // Only allow owner to delete (RLS will handle this, but we check for better error messages)
    if (plant.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this plant' },
        { status: 403 }
      );
    }

    // Delete the plant (RLS will ensure only the owner can delete)
    const { error: deleteError } = await supabase
      .from('plants')
      .delete()
      .eq('id', plantId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting plant:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete plant' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in plants DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParam = searchParams.get('q');
    const userId = searchParams.get('userId');

    const supabase = await getSupabaseServerClient();
    let query = supabase.from('plants').select('*');

    if (userId) {
      // Filter by userId
      query = query.eq('user_id', userId);
    } else if (queryParam) {
      // Search functionality using Supabase's full-text search
      query = query.or(`name.ilike.%${queryParam}%,description.ilike.%${queryParam}%`);
    }

    // Order by created_at
    query = query.order('created_at', { ascending: false });

    const { data: plants, error } = await query;

    if (error) {
      console.error('Error fetching plants:', error);
      return NextResponse.json(
        { error: 'Failed to fetch plants' },
        { status: 500 }
      );
    }

    return NextResponse.json(plants || []);
  } catch (error) {
    console.error('Error in plants GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const admin = getSupabaseAdminClient();
    
    const formData = await request.formData();

    // Try session first; fall back to provided user fields
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const fallbackUserId = (formData.get('userId') as string) || '';
    const fallbackUserName = (formData.get('userName') as string) || '';
    const effectiveUserId = user?.id || fallbackUserId;
    const effectiveUserName = user?.user_metadata?.name || user?.email || fallbackUserName || 'User';
    if (!effectiveUserId) {
      return NextResponse.json(
        { error: 'Unauthorized', details: authError?.message ?? 'No active session' },
        { status: 401 }
      );
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const lat = parseFloat(formData.get('lat') as string);
    const lng = parseFloat(formData.get('lng') as string);
    const imageFile = formData.get('image') as File | null;

    // Validate required fields
    if (!name || !lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate coordinates (assuming the same validation as before)
    if (lat < 29.2 || lat > 29.6 || lng < 76.7 || lng > 77.2) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    let imageUrl: string | null = null;

    // Upload image to Supabase Storage if provided (use admin client to avoid policy issues)
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${effectiveUserId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await admin.storage
        .from('plants')
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload image', details: uploadError.message },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: urlData } = admin.storage
        .from('plants')
        .getPublicUrl(fileName);
      
      imageUrl = urlData.publicUrl;
    }

    // Save to Supabase Database
    const { data: plant, error: insertError } = await admin
      .from('plants')
      .insert({
        name,
        description,
        user_id: effectiveUserId,
        user_name: effectiveUserName,
        lat,
        lng,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting plant:', insertError);
      return NextResponse.json(
        { error: 'Failed to save plant', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(plant);
  } catch (error) {
    console.error('Error in plants POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}