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
    const body = await request.json();
    const { repo, issueNumber, reward, title, description, tags } = body;

    // 1. Validation
    if (!repo || !issueNumber || !reward) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Add Bounty to DB first (as unfunded)
    // This gives us the ID we need for the success callback
    const newBounty = await db.addBounty({
      title,
      description,
      repo_fullname: repo,
      issue_number: parseInt(issueNumber, 10),
      reward_amount: parseFloat(reward),
      status: 'pending', 
      maintainer_id: user.id,
      funding_status: 'unfunded',
      tags: tags || []
    });

    if (!newBounty) {
      throw new Error('Failed to create bounty record');
    }

    // 3. Create Locus session with the Bounty ID in the successUrl
    const baseUrl = process.env.NEXT_PUBLIC_URL || 
                    process.env.AUTH_URL ||
                    process.env.NEXTAUTH_URL ||
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3001');
    
    console.log(`Creating Locus Session for Bounty ${newBounty.id} (${repo}#${issueNumber})`);
    
    const sessionResponse = await createCheckoutSession({
      amount: parseFloat(reward),
      description: `Bounty for ${repo}#${issueNumber}: ${title}`,
      successUrl: `${baseUrl}/api/locus/verify?bountyId=${newBounty.id}`,
      cancelUrl: `${baseUrl}/maintainer/bounties?cancelled=true`,
      webhookUrl: `${baseUrl}/api/webhooks/locus`, // Still sending just in case
      metadata: { 
        repo, 
        issueNumber, 
        maintainerId: user.id, 
        bountyId: newBounty.id 
      }
    });

    if (!sessionResponse.success || !sessionResponse.data) {
      // If payment session fails, we keep the bounty as pending but flag the error
      console.error('Locus Session Error:', sessionResponse.message);
      return NextResponse.json(
        { success: false, error: 'Locus Session Error', message: sessionResponse.message },
        { status: 500 }
      );
    }

    // 4. Update the bounty with the session details
    await db.updateBounty(newBounty.id, {
      locus_session_id: sessionResponse.data.id,
      locus_webhook_secret: sessionResponse.data.webhookSecret,
      locus_checkout_url: sessionResponse.data.checkoutUrl
    });

    return NextResponse.json({
      success: true,
      data: {
        bounty: { ...newBounty, locus_checkout_url: sessionResponse.data.checkoutUrl },
        locus: {
          sessionId: sessionResponse.data.id,
          checkoutUrl: sessionResponse.data.checkoutUrl
        }
      }
    });

  } catch (error: any) {
    console.error('[BOUNTY-API-ERROR] Handled Exception');
    console.error(error);
    return NextResponse.json({ 
      error: error.name || 'API_ERROR', 
      message: error.message,
      detail: error.toString() 
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const identity = await getRequestIdentity(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bounties = await db.getBounties();
    return NextResponse.json({ success: true, data: bounties });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
