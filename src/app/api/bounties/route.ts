import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRequestIdentity } from '@/auth';

export async function GET(request: Request) {
  try {
    const identity = await getRequestIdentity(request);
    const userId = identity?.user?.id;

    // Fetch all bounties from DB
    const bounties = await db.getBounties();
    
    // 🛡️ Discovery & Privacy Filter:
    // - Show 'open' or 'processing' bounties to everyone
    // - Show 'pending' bounties ONLY to the maintainer who created them
    const filteredBounties = bounties.filter(b => {
      // If it's active, anyone can see it
      if (b.status === 'open' || b.status === 'processing' || b.status === 'merged' || b.status === 'paid') {
        // High-level funded check for discovery (merged/paid might be partially funded in some states, but usually are)
        return b.funding_status === 'funded' || b.status === 'merged' || b.status === 'paid';
      }

      // If it's pending (unfunded), ONLY the creator can see it
      if (b.status === 'pending') {
        return userId && b.maintainer_id === userId;
      }

      return false;
    });

    return NextResponse.json({
      success: true,
      data: filteredBounties
    });
  } catch (error) {
    console.error('Error in bounties API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
