import { NextResponse } from 'next/server';
import { checkBalance } from '@/lib/locus';

export async function GET() {
  try {
    const result = await checkBalance();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Balance API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'INTERNAL_ERROR', 
      message: error.message 
    }, { status: 500 });
  }
}
