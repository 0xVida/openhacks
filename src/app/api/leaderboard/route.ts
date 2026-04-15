import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('username, avatar_url, reputation, full_name')
      .order('reputation', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: profiles });
  } catch (error) {
    console.error('Leaderboard API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
