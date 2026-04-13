import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEscrow } from '@/lib/locus';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, repo, issueNumber, reward, contributorEmail } = await request.json();

    if (!title || !description || !repo || !issueNumber || !reward) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Lock funds in Locus (Escrow)
    const escrowTarget = contributorEmail || 'escrow@openhacks.com';
    const memo = `Escrow for Bounty: ${title} (${repo}#${issueNumber})`;
    
    console.log(`Locking ${reward} USDC in Locus escrow for ${escrowTarget}`);
    const locusResponse = await sendEscrow(escrowTarget, reward, memo);

    if (!locusResponse.success) {
      console.error('Locus escrow failed:', locusResponse.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment escrow failed', 
          message: locusResponse.message || 'The Locus API could not process the escrow. Check your balance and API key.' 
        },
        { status: 500 }
      );
    }

    // 2. Add to Supabase
    let maintainerId = (session.user as any).id;
    
    // Safety check: ensure we have a Supabase UUID, not a GitHub ID string
    if (!maintainerId || !maintainerId.includes('-')) {
       console.log(`Maintainer ID ${maintainerId} is not a UUID, fetching from DB...`);
       const { data: profile } = await db.getProfile((session.user as any).login || session.user.name);
       if (profile) {
         maintainerId = profile.id;
       }
    }

    const newBounty = await db.addBounty({
      title,
      description,
      repo_fullname: repo,
      issue_number: parseInt(issueNumber, 10),
      reward_amount: parseFloat(reward),
      status: 'open',
      maintainer_id: maintainerId
    });

    return NextResponse.json({
      success: true,
      data: newBounty
    });
  } catch (error) {
    console.error('Error creating bounty:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
