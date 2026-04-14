import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
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
          const bounty = await db.findBountyByIssue(repo, issueNumber);

          if (bounty && bounty.status === 'open') {
            console.log(`Bounty found! ID: ${bounty.id}, Amount: ${bounty.reward_amount}`);

            // 1. Update internal status to 'merged'
            await db.updateBountyStatus(bounty.id, 'merged', author);

            // 2. Trigger Locus Email Payout
            const memo = `Payout for OpenHacks Bounty: ${bounty.title} (${repo}#${issueNumber})`;
            
            // Fallback email if not found (using GitHub noreply or placeholder)
            const recipientEmail = `${author}@users.noreply.github.com`;
            
            console.log(`Triggering Locus email escrow: ${bounty.reward_amount} USDC for ${recipientEmail}`);
            
            const payoutResponse = await sendEscrow(
              recipientEmail,
              bounty.reward_amount,
              memo
            );

            if (payoutResponse.success) {
              await db.updateBountyStatus(bounty.id, 'paid');
              console.log(`Email escrow successful: ${payoutResponse.data?.transaction_id}`);
            } else {
              console.error(`Email payout failed: ${payoutResponse.error} - ${payoutResponse.message}`);
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
