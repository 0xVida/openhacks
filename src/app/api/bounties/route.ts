import { NextResponse } from 'next/server';
import { getBounties } from '@/lib/store';

export async function GET() {
  try {
    const bounties = getBounties();
    // Return only open bounties to agents
    const openBounties = bounties.filter(b => b.status === 'open');
    
    return NextResponse.json({
      success: true,
      data: openBounties
    });
  } catch (error) {
    console.error('Error fetching bounties:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
