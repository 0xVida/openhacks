import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Public endpoint for contributors to discover work across all maintainers
    const bounties = await db.getBounties();
    
    // 🛡️ Discovery Filtration: Only show bounties that are FUNDED and ACTIVE
    const fundedBounties = bounties.filter(b => 
      b.funding_status === 'funded' && 
      (b.status === 'open' || b.status === 'processing')
    );

    return NextResponse.json({
      success: true,
      data: fundedBounties
    });
  } catch (error) {
    console.error('Error in public discovery API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
