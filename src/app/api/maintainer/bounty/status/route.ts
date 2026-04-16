import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRequestIdentity } from '@/auth';
import { getCheckoutSessionStatus } from '@/lib/locus';

export async function GET(request: Request) {
  try {
    const identity = await getRequestIdentity(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const bountyId = searchParams.get('bountyId');

    if (!sessionId || !bountyId) {
      return NextResponse.json({ error: 'Missing sessionId or bountyId' }, { status: 400 });
    }

    const locusRes = await getCheckoutSessionStatus(sessionId);

    if (!locusRes.success || !locusRes.data) {
      return NextResponse.json({
        success: false,
        error: locusRes.error || 'Locus Error',
        message: locusRes.message
      });
    }

    const locusStatus = locusRes.data.status; // 'PAID', 'PENDING', etc.
    const isActuallyPaid = locusStatus?.toLowerCase() === 'paid';

    if (isActuallyPaid) {
      const bounty = await db.getBounty(bountyId);

      if (bounty && bounty.funding_status !== 'funded') {
        console.log(`Auto-Sync: Locus reports session ${sessionId} is PAID (case-insensitive). Activating bounty ${bountyId}.`);
        await db.updateBounty(bountyId, {
          funding_status: 'funded',
          status: 'open',
          funded_at: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({
      success: true,
      status: locusStatus,
      isFunded: isActuallyPaid
    });

  } catch (error: any) {
    console.error('Bounty Status Check Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
