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

import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/app/config/supabase-server';
import { getSupabaseAdminClient } from '@/app/config/supabase-admin';

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  ctx: { params: Promise<{ uuid: string }> }
) {
  try {
    const params = await ctx.params;
    const supabase = await getSupabaseServerClient();
    const admin = getSupabaseAdminClient();

    // Try to fetch from public.users first
    const { data: profile, error } = await admin
      .from('users')
      .select('*')
      .eq('id', params.uuid)
      .single();

    if (profile && !error) {
      return NextResponse.json(profile);
    }

    // If not found, try to upsert from auth session if this is the same user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser || authUser.id !== params.uuid) {
      // Return null so clients can handle first-time profiles gracefully
      return NextResponse.json(null);
    }

    const upsertPayload = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name ?? authUser.email?.split('@')[0] ?? 'User',
      avatar_url: authUser.user_metadata?.avatar_url ?? null,
    } as const;

    const { data: upserted, error: upsertError } = await admin
      .from('users')
      .upsert(upsertPayload)
      .select('*')
      .single();

    if (upsertError) {
      console.error('Error upserting user profile:', upsertError);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    return NextResponse.json(upserted);
  } catch (error) {
    console.error('Error in user GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  ctx: { params: Promise<{ uuid: string }> }
) {
  try {
    const params = await ctx.params;
    const supabase = await getSupabaseServerClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user || user.id !== params.uuid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, avatar_url } = body;

    // Update the user data
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ name, avatar_url })
      .eq('id', params.uuid)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error in user PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
