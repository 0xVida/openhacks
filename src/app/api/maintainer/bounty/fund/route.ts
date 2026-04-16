import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRequestIdentity } from '@/auth';
import { createCheckoutSession } from '@/lib/locus';

export async function POST(request: Request) {
  try {
    const identity = await getRequestIdentity(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = identity;
    const { bountyId } = await request.json();

    if (!bountyId) {
      return NextResponse.json({ error: 'Missing bountyId' }, { status: 400 });
    }

    // 1. Fetch existing bounty & Verify ownership
    const bounty = await db.getBounty(bountyId);
    if (!bounty) {
      return NextResponse.json({ error: 'Bounty not found' }, { status: 404 });
    }

    if (bounty.maintainer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this bounty' }, { status: 403 });
    }

    // 2. Only allow refresh if it's still pending
    if (bounty.status !== 'pending') {
      return NextResponse.json({ error: 'Bounty is already active or closed' }, { status: 400 });
    }

    // 3. Create a FRESH Locus session
    const baseUrl = process.env.NEXT_PUBLIC_URL || 
                    process.env.AUTH_URL ||
                    process.env.NEXTAUTH_URL ||
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    const sessionResponse = await createCheckoutSession({
      amount: bounty.reward_amount,
      description: `Bounty for ${bounty.repo_fullname}#${bounty.issue_number}: ${bounty.title}`,
      successUrl: `${baseUrl}/api/locus/verify?bountyId=${bounty.id}`,
      cancelUrl: `${baseUrl}/?cancelled=true`,
      webhookUrl: `${baseUrl}/api/webhooks/locus`,
      metadata: { 
        repo: bounty.repo_fullname, 
        issueNumber: bounty.issue_number, 
        maintainerId: user.id, 
        bountyId: bounty.id 
      }
    });

    if (!sessionResponse.success || !sessionResponse.data) {
      return NextResponse.json(
        { success: false, error: 'Locus Session Error', message: sessionResponse.message },
        { status: 500 }
      );
    }

    // 4. Update the bounty with the new session details
    await db.updateBounty(bounty.id, {
      locus_session_id: sessionResponse.data.id,
      locus_webhook_secret: sessionResponse.data.webhookSecret,
      locus_checkout_url: sessionResponse.data.checkoutUrl
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: sessionResponse.data.id,
        checkoutUrl: sessionResponse.data.checkoutUrl,
        bountyId: bounty.id,
        title: "Bounty Initialized",
        message: "Your new funding session is ready. Click below to proceed to Locus secure checkout."
      }
    });

  } catch (error: any) {
    console.error('Bounty Refresh Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
