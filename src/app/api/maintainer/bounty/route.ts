import { NextResponse } from 'next/server';
import { addBounty, Bounty } from '@/lib/store';
import { sendEscrow } from '@/lib/locus';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { title, description, repo, issueNumber, reward, contributorEmail } = await request.json();

    if (!title || !description || !repo || !issueNumber || !reward) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Lock funds in Locus (Escrow)
    // We use sendEscrow which sends USDC to an email address.
    // If we don't have the contributor's email yet, we can send it to a "holding" address
    // or just memoize the intent. For this demo, we'll use a placeholder email.
    const escrowTarget = contributorEmail || 'escrow@openhacks.com';
    const memo = `Escrow for Bounty: ${title} (${repo}#${issueNumber})`;
    
    console.log(`Locking ${reward} USDC in Locus escrow for ${escrowTarget}`);
    const locusResponse = await sendEscrow(escrowTarget, reward, memo);

    if (!locusResponse.success) {
      console.error('Locus escrow failed:', locusResponse.error);
      return NextResponse.json(
        { success: false, error: 'Payment escrow failed', message: locusResponse.message },
        { status: 500 }
      );
    }

    // 2. Add to local store
    const newBounty: Bounty = {
      id: uuidv4(),
      title,
      description,
      repo,
      issueNumber: parseInt(issueNumber, 10),
      reward: parseFloat(reward),
      status: 'open',
      locusEscrowId: locusResponse.data?.transaction_id
    };

    addBounty(newBounty);

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
