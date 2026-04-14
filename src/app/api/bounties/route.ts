import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Public endpoint for contributors to discover work across all maintainers
    const bounties = await db.getBounties();
    
    // Filter out internal metadata if necessary, but for now we return all
    return NextResponse.json({
      success: true,
      data: bounties
    });
  } catch (error) {
    console.error('Error in public discovery API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
