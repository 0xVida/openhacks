import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCheckoutSessionStatus } from '@/lib/locus';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bountyId = searchParams.get('bountyId');
  const acceptHeader = request.headers.get('Accept');
  const isJsonRequest = acceptHeader?.includes('application/json');

  if (!bountyId) {
    if (isJsonRequest) {
      return NextResponse.json({ success: false, error: 'Missing bountyId' }, { status: 400 });
    }
    return NextResponse.redirect(new URL('/?error=missing_bounty_id', request.url));
  }

  try {
    const bounty = await db.getBounty(bountyId);
    if (!bounty || !bounty.locus_session_id) {
      if (isJsonRequest) {
        return NextResponse.json({ success: false, error: 'Bounty or Session ID not found' }, { status: 404 });
      }
      return NextResponse.redirect(new URL('/?error=bounty_not_found', request.url));
    }

    let isActuallyPaid = false;
    const maxRetries = 5;

    for (let i = 0; i < maxRetries; i++) {
      const locusRes = await getCheckoutSessionStatus(bounty.locus_session_id);

      if (locusRes.success && locusRes.data?.status?.toLowerCase() === 'paid') {
        isActuallyPaid = true;
        break;
      }

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!isActuallyPaid) {
      if (isJsonRequest) {
        return NextResponse.json({ success: false, error: 'Payment not verified after polling' }, { status: 402 });
      }
      return NextResponse.redirect(new URL('/?error=payment_unverified', request.url));
    }

    //success: Mark as funded and open
    await db.updateBounty(bountyId, {
      funding_status: 'funded',
      status: 'open',
      funded_at: new Date().toISOString()
    });

    if (isJsonRequest) {
      return NextResponse.json({
        success: true,
        message: 'Bounty verified and activated successfully',
        bountyId
      });
    }

    return NextResponse.redirect(new URL('/?payment_success=true', request.url));
  } catch (error: any) {
    if (isJsonRequest) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error.message)}`, request.url));
  }
}
