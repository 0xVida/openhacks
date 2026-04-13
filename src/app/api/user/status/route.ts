import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: true, 
        role: 'contributor', 
        isRegistered: false,
        repos: [] 
      });
    }

    const login = (session.user as any).login || session.user.name;
    
    // Fetch profile from Supabase
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('username', login)
      .single();

    if (error || !profile) {
      return NextResponse.json({
        success: true,
        role: 'contributor',
        isRegistered: false,
        repos: []
      });
    }

    return NextResponse.json({
      success: true,
      role: profile.role,
      isRegistered: profile.role === 'maintainer',
      repos: profile.metadata?.repos || [],
      reputation: profile.reputation
    });
  } catch (error) {
    console.error('Error fetching user status:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { repoFullName } = await req.json();
    if (!repoFullName) {
      return NextResponse.json({ success: false, error: 'Repo name required' }, { status: 400 });
    }

    const login = (session.user as any).login || session.user.name;
    
    // Get current profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', login)
      .single();

    if (!profile) {
       return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    const currentRepos = profile.metadata?.repos || [];
    if (!currentRepos.includes(repoFullName)) {
      currentRepos.push(repoFullName);
    }

    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update({
        role: 'maintainer',
        metadata: { ...profile.metadata, repos: currentRepos }
      })
      .eq('username', login);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Maintainer repository registered successfully'
    });
  } catch (error) {
    console.error('Error registering maintainer repo:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
