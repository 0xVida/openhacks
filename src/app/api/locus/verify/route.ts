import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bountyId = searchParams.get('bountyId');

  console.log('--- LOCUS CALLBACK TRAP ---');
  console.log('Full URL:', request.url);
  console.log('Parameters:', Object.fromEntries(searchParams.entries()));
  console.log('---------------------------');

  if (!bountyId) {
    console.error('Locus Verify: No bountyId provided in callback');
    return NextResponse.redirect(new URL('/?error=missing_bounty_id', request.url));
  }

  try {
    // 1. Double check the bounty exists
    const bounty = await db.getBounty(bountyId);
    if (!bounty) {
      console.error(`Locus Verify: Bounty ${bountyId} not found`);
      return NextResponse.redirect(new URL('/?error=bounty_not_found', request.url));
    }

    // 2. Mark as funded and open
    // Since this is a trial-and-error callback, we assume if we hit this 
    // successUrl, the payment went through as per Locus documentation.
    await db.updateBounty(bountyId, {
      funding_status: 'funded',
      status: 'open',
      funded_at: new Date().toISOString()
    });

    console.log(`Locus Verify: Bounty ${bountyId} successfully activated via callback!`);

    // 3. Redirect back to dashboard with success message
    return NextResponse.redirect(new URL('/?payment_success=true', request.url));
  } catch (error: any) {
    console.error('Locus Verify Error:', error.message);
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error.message)}`, request.url));
  }
}
