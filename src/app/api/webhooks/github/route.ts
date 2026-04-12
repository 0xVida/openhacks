import { NextResponse } from 'next/server';
import { findBountyByIssue, updateBountyStatus } from '@/lib/store';
import { sendPayment } from '@/lib/locus';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const event = request.headers.get('x-github-event');

    console.log(`Received GitHub event: ${event}`);

    // Handle Pull Request events
    if (event === 'pull_request') {
      const { action, pull_request } = payload;

      // We only care about merged PRs
      if (action === 'closed' && pull_request.merged === true) {
        const repo = pull_request.base.repo.full_name; // e.g. "owner/repo"
        const body = pull_request.body || '';
        const author = pull_request.user.login;

        console.log(`PR merged in ${repo} by ${author}`);

        // Extract issue references (Closes #123, Fixes #123, etc.)
        const issueMatch = body.match(/(?:closes|fixes|resolves)\s+#(\d+)/i);
        
        if (issueMatch) {
          const issueNumber = parseInt(issueMatch[1], 10);
          console.log(`PR references issue #${issueNumber}`);

          // Find the bounty associated with this issue
          const bounty = findBountyByIssue(repo, issueNumber);

          if (bounty && bounty.status === 'open') {
            console.log(`Bounty found! ID: ${bounty.id}, Amount: ${bounty.reward}`);

            // 1. Update internal status to 'merged'
            updateBountyStatus(bounty.id, 'merged', author);

            // 2. Trigger Locus Payout
            // Note: In a real app, we'd need the contributor's wallet address.
            // For now, we'll use a placeholder or the author's GitHub handle as email if they've linked it.
            // As per the plan, we'll try to find a linked address or logic.
            // For this demo, we'll trigger a memoized payment to the "contributor".
            
            const memo = `Payout for OpenHacks Bounty: ${bounty.title} (${repo}#${issueNumber})`;
            
            // In a real scenario, we'd have a mapping of GH handle -> Locus wallet/email
            // Here we'll simulate a payout to a generic 'payment' endpoint or log it.
            console.log(`Triggering Locus payout: ${bounty.reward} USDC for ${author}`);
            
            // For now, let's assume we have a way to resolve the author's payout target.
            // We'll call sendPayment with a dummy address for verification.
            // Real implementation would look up `author` in a user table.
            const payoutResponse = await sendPayment(
              '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Placeholder recipient
              bounty.reward,
              memo
            );

            if (payoutResponse.success) {
              updateBountyStatus(bounty.id, 'paid');
              console.log(`Payout successful: ${payoutResponse.data?.transaction_id}`);
            } else {
              console.error(`Payout failed: ${payoutResponse.error} - ${payoutResponse.message}`);
            }
          } else {
            console.log(`No active bounty found for ${repo}#${issueNumber}`);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in GitHub webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
