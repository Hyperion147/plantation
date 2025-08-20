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
      // Search functionality using Supabase's full-text search and PID
      if (!isNaN(Number(queryParam))) {
        // If query is a number, search by pid as well
        query = query.or(`name.ilike.%${queryParam}%,description.ilike.%${queryParam}%,pid.eq.${queryParam}`);
      } else {
        query = query.or(`name.ilike.%${queryParam}%,description.ilike.%${queryParam}%`);
      }
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
    // Get the current max PID - use a more robust query to handle both numeric and non-numeric PIDs
    const { data: maxPidData, error: maxPidError } = await admin
      .from('plants')
      .select('pid')
      .order('pid', { ascending: false })
      .limit(1);

    if (maxPidError) {
      console.error('Error fetching max PID:', maxPidError);
      return NextResponse.json(
        { error: 'Failed to generate PID', details: maxPidError.message },
        { status: 500 }
      );
    }

    let nextPid = 1001;
    if (maxPidData && maxPidData.length > 0 && maxPidData[0].pid) {
      const lastPid = maxPidData[0].pid;
      // Try to parse as integer, but handle cases where PID might be non-numeric
      const numericPid = parseInt(lastPid.toString(), 10);
      if (!isNaN(numericPid) && numericPid >= 1001) {
        nextPid = numericPid + 1;
      } else {
        // If the last PID is not numeric or less than 1001, start from 1001
        nextPid = 1001;
      }
    }

    console.log('PID generation:', { maxPidData, nextPid, lastPid: maxPidData?.[0]?.pid });

    // Ensure we have a unique PID by checking if it already exists
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      // Check if this PID already exists
      const { data: existingPid, error: checkError } = await admin
        .from('plants')
        .select('pid')
        .eq('pid', String(nextPid))
        .single();
      
      if (checkError && checkError.code === 'PGRST116') {
        // PID doesn't exist, we can use it
        break;
      } else if (checkError) {
        console.error('Error checking PID uniqueness:', checkError);
        break;
      } else if (existingPid) {
        // PID exists, increment and try again
        nextPid++;
        attempts++;
      } else {
        // No error and no data means PID doesn't exist
        break;
      }
    }

    console.log('Final PID after uniqueness check:', nextPid, 'attempts:', attempts);

    // Try to insert with the generated PID
    console.log('Attempting to insert with PID:', String(nextPid));
    let insertResult = await admin
      .from('plants')
      .insert({
        name,
        description,
        user_id: effectiveUserId,
        user_name: effectiveUserName,
        lat,
        lng,
        image_url: imageUrl,
        pid: String(nextPid),
      })
      .select()
      .single();

    console.log('Insert result:', { success: !insertResult.error, error: insertResult.error });

    // If PID conflict, try with a timestamp-based PID as fallback
    if (insertResult.error && insertResult.error.code === '23505') { // Unique constraint violation
      console.log('PID conflict, using fallback PID generation');
      const fallbackPid = `P${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log('Fallback PID:', fallbackPid);
      
      insertResult = await admin
        .from('plants')
        .insert({
          name,
          description,
          user_id: effectiveUserId,
          user_name: effectiveUserName,
          lat,
          lng,
          image_url: imageUrl,
          pid: fallbackPid,
        })
        .select()
        .single();
        
      console.log('Fallback insert result:', { success: !insertResult.error, error: insertResult.error });
    }

    // If still failing, try one more time with a completely random PID
    if (insertResult.error && insertResult.error.code === '23505') {
      console.log('Still getting PID conflict, using random PID');
      const randomPid = `P${Math.random().toString(36).substr(2, 15)}`;
      console.log('Random PID:', randomPid);
      
      insertResult = await admin
        .from('plants')
        .insert({
          name,
          description,
          user_id: effectiveUserId,
          user_name: effectiveUserName,
          lat,
          lng,
          image_url: imageUrl,
          pid: randomPid,
        })
        .select()
        .single();
        
      console.log('Random PID insert result:', { success: !insertResult.error, error: insertResult.error });
    }

    const { data: plant, error: insertError } = insertResult;

    if (insertError) {
      console.error('Error inserting plant:', insertError);
      return NextResponse.json(
        { error: 'Failed to save plant', details: insertError.message },
        { status: 500 }
      );
    }

    console.log('Plant successfully created with PID:', plant.pid);

    return NextResponse.json(plant);
  } catch (error) {
    console.error('Error in plants POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}