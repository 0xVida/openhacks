const LOCUS_API_KEY = process.env.LOCUS_API_KEY;
const LOCUS_API_BASE = process.env.LOCUS_API_BASE || 'https://beta-api.paywithlocus.com/api';

export interface LocusResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BalanceData {
  wallet_address: string;
  chain: string;
  usdc_balance: string;
  allowance: number;
}

export interface PayoutData {
  transaction_id: string;
  status: string;
  amount: number;
  to_address?: string;
  recipient_email?: string;
}

export async function checkBalance(): Promise<LocusResponse<BalanceData>> {
  const response = await fetch(`${LOCUS_API_BASE}/pay/balance`, {
    headers: {
      'Authorization': `Bearer ${LOCUS_API_KEY}`,
    },
  });
  return response.json();
}

/**
 * Send USDC to an address directly.
 */
export async function sendPayment(toAddress: string, amount: number, memo: string): Promise<LocusResponse<PayoutData>> {
  const response = await fetch(`${LOCUS_API_BASE}/pay/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOCUS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to_address: toAddress,
      amount,
      memo,
    }),
  });
  return response.json();
}

/**
 * Send USDC to an email (Escrow).
 */
export async function sendEscrow(email: string, amount: number, memo: string): Promise<LocusResponse<PayoutData>> {
  const response = await fetch(`${LOCUS_API_BASE}/pay/send-email`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOCUS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount,
      memo,
    }),
  });
  return response.json();
}
