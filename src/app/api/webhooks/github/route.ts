import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEscrow } from '@/lib/locus';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const event = request.headers.get('x-github-event');

    // 1. Signature Verification (Anti-Spoofing)
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (secret && signature) {
      const hmac = crypto.createHmac('sha256', secret);
      const digest = 'sha256=' + hmac.update(rawBody).digest('hex');
      
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
        console.warn('GitHub Webhook: Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    console.log(`Received GitHub event: ${event}`);

    // Handle Pull Request events
    if (event === 'pull_request') {
      const { action, pull_request } = payload;

      // We only care about merged PRs
      if (action === 'closed' && pull_request.merged === true) {
        const repo = pull_request.base.repo.full_name;
        const body = pull_request.body || '';
        const author = pull_request.user.login;

        console.log(`PR merged in ${repo} by ${author}`);

        // 2. Robust Regex (Fixes Fragile PR Linking)
        // Matches: Fixes #123, Closes #123, Resolves #123, Fix #123, etc.
        const issueRegex = /(?:close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)\s+#(\d+)/gi;
        let match;
        const processedIssues = new Set<number>();

        while ((match = issueRegex.exec(body)) !== null) {
          const issueNumber = parseInt(match[1], 10);
          if (processedIssues.has(issueNumber)) continue;
          processedIssues.add(issueNumber);

          console.log(`PR references issue #${issueNumber}`);

          // Find the bounty associated with this issue
          const bounty = await db.findBountyByIssue(repo, issueNumber);

          // 3. Ghost Bounty Protection
          // Only pay if the bounty is Funded and Open
          if (bounty && bounty.status === 'open' && bounty.funding_status === 'funded') {
            console.log(`Bounty found! ID: ${bounty.id}, Amount: ${bounty.reward_amount}`);

            // Update status to 'merged'
            await db.updateBountyStatus(bounty.id, 'merged', author);

            const memo = `Payout for OpenHacks Bounty: ${bounty.title} (${repo}#${issueNumber})`;
            const recipientEmail = `${author}@users.noreply.github.com`;
            
            console.log(`Triggering Locus email escrow: ${bounty.reward_amount} USDC for ${recipientEmail}`);
            
            const payoutResponse = await sendEscrow(
              recipientEmail,
              bounty.reward_amount,
              memo
            );

            if (payoutResponse.success) {
              await db.updateBountyStatus(bounty.id, 'paid');
              console.log(`Email escrow successful for issue #${issueNumber}`);
            } else {
              console.error(`Email payout failed for issue #${issueNumber}: ${payoutResponse.error}`);
            }
          } else if (bounty && bounty.funding_status !== 'funded') {
            console.warn(`Bounty found for #${issueNumber} but it is UNFUNDED. Skipping payout.`);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in GitHub webhook:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
