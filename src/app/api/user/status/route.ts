import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getMaintainer } from '@/lib/store';

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
    const maintainerData = getMaintainer(login);

    if (maintainerData) {
      return NextResponse.json({
        success: true,
        role: 'maintainer',
        isRegistered: true,
        repos: maintainerData.repos
      });
    }

    return NextResponse.json({
      success: true,
      role: 'contributor',
      isRegistered: false,
      repos: []
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

    const { addMaintainerRepo } = await import('@/lib/store');
    const login = (session.user as any).login || session.user.name;
    
    addMaintainerRepo(login, repoFullName);

    return NextResponse.json({
      success: true,
      message: 'Maintainer repository registered successfully'
    });
  } catch (error) {
    console.error('Error registering maintainer repo:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
