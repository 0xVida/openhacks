import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/locus';

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-signature-256');

    if (!signature) {
      console.warn('Locus Webhook: Missing signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const { event, data } = JSON.parse(payload);
    const sessionId = data.sessionId || data.session_id;

    // 1. Find the bounty associated with this session
    const bounty = await db.getBountyBySessionId(sessionId);
    if (!bounty) {
      console.error(`Locus Webhook: No bounty found for session ${sessionId}`);
      return NextResponse.json({ error: 'Bounty not found' }, { status: 404 });
    }

    // 2. Handle Paid Event
    if (event === 'checkout.session.paid') {
      console.log(`Locus Webhook: Bounty ${bounty.id} successfully funded!`);
      
      await db.updateBounty(bounty.id, {
        funding_status: 'funded',
        status: 'open',
        funded_at: new Date().toISOString()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Locus Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
