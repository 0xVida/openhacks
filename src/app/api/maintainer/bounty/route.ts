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

    let { title, description, repo, issueNumber, reward, contributorEmail } = await request.json();

    if (!repo || !issueNumber || !reward) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (repo, issueNumber, reward)' },
        { status: 400 }
      );
    }

    // Auto-fetch issue details if missing
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

    // 1. Prepare Escrow Details (Platform is the custodian)
    const platformWallet = process.env.LOCUS_PLATFORM_WALLET || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    
    // 2. Map maintainer ID
    let maintainerId = user.id;

    const newBounty = await db.addBounty({
      title,
      description,
      repo_fullname: repo,
      issue_number: parseInt(issueNumber, 10),
      reward_amount: parseFloat(reward),
      status: 'open', // We'll set to open for now, but mark funding_status
      maintainer_id: maintainerId,
      funding_status: 'unfunded',
      escrow_address: platformWallet
    });

    if (!newBounty) throw new Error('Failed to create bounty record');

    return NextResponse.json({
      success: true,
      data: {
        bounty: newBounty,
        funding_instructions: {
          address: platformWallet,
          amount: parseFloat(reward),
          memo: `fund_bounty:${newBounty.id}`,
          token: 'USDC'
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
