import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getIssueDetails } from '@/lib/github';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const { getRequestIdentity } = await import('@/auth');
    const identity = await getRequestIdentity(request);
    
    if (!identity) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = identity;

    let { title, description, repo, issueNumber, reward } = await request.json();

    if (!repo || !issueNumber || !reward) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (repo, issueNumber, reward)' },
        { status: 400 }
      );
    }

    // 1. Ownership Hijacking Check
    const { checkRepoAccess } = await import('@/lib/github');
    const hasAccess = await checkRepoAccess(repo, user.login);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: `You do not have write access to ${repo}. Only maintainers can create bounties.` },
        { status: 403 }
      );
    }

    // 2. Auto-fetch issue details if missing
    if (!title || !description) {
      const details = await getIssueDetails(repo, parseInt(issueNumber, 10));
      if (details.success) {
        title = title || details.title;
        description = description || details.description;
      } else if (!title) {
        return NextResponse.json(
          { success: false, error: 'Could not fetch issue details from GitHub. Please provide title and description manually.' },
          { status: 400 }
        );
      }
    }

    // 3. Create Locus Checkout Session
    const { createCheckoutSession } = await import('@/lib/locus');
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    
    const sessionResponse = await createCheckoutSession({
      amount: parseFloat(reward),
      description: `Bounty for ${repo}#${issueNumber}: ${title}`,
      successUrl: `${baseUrl}/maintainer/bounties?success=true`,
      cancelUrl: `${baseUrl}/maintainer/bounties?cancelled=true`,
      webhookUrl: `${baseUrl}/api/webhooks/locus`,
      metadata: { repo, issueNumber, maintainerId: user.id }
    });

    if (!sessionResponse.success || !sessionResponse.data) {
      return NextResponse.json(
        { success: false, error: 'Locus Session Error', message: sessionResponse.message },
        { status: 500 }
      );
    }

    // 4. Record Pending Bounty in DB
    const newBounty = await db.addBounty({
      title,
      description,
      repo_fullname: repo,
      issue_number: parseInt(issueNumber, 10),
      reward_amount: parseFloat(reward),
      status: 'pending', // Starts in pending until funded
      maintainer_id: user.id,
      funding_status: 'unfunded',
      locus_session_id: sessionResponse.data.id,
      locus_webhook_secret: sessionResponse.data.webhookSecret
    });

    if (!newBounty) throw new Error('Failed to create bounty record');

    return NextResponse.json({
      success: true,
      data: {
        bounty: newBounty,
        locus: {
          sessionId: sessionResponse.data.id,
          checkoutUrl: sessionResponse.data.checkoutUrl
        }
      }
    });
  } catch (error) {
    console.error('Error creating bounty:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bounties = await db.getBounties();
    return NextResponse.json({
      success: true,
      data: bounties
    });
  } catch (error) {
    console.error('Error fetching bounties:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
