import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRequestIdentity } from '@/auth';

export async function GET(request: Request) {
  try {
    const identity = await getRequestIdentity(request);
    if (!identity) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const total = await db.getEscrowTotal(identity.user.id);

    return NextResponse.json({
      success: true,
      data: {
        usdc_balance: total.toFixed(2),
        label: 'Project Escrow'
      }
    });
  } catch (error: any) {
    console.error('Balance API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'INTERNAL_ERROR', 
      message: error.message 
    }, { status: 500 });
  }
}
