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
  try {
    if (!LOCUS_API_KEY) {
      console.error('LOCUS_API_KEY is missing from environment variables');
      return { success: false, error: 'Configuration Error', message: 'Locus API Key is not set' };
    }

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

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Locus API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      return { 
        success: false, 
        error: data.error || 'API_ERROR', 
        message: data.message || `Locus API responded with status ${response.status}` 
      };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Locus sendEscrow Exception:', error);
    return { 
      success: false, 
      error: 'NETWORK_ERROR', 
      message: error.message || 'Failed to connect to Locus API' 
    };
  }
}
