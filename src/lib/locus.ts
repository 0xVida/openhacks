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
  try {
    if (!LOCUS_API_KEY) {
      return { success: false, error: 'Configuration Error', message: 'Locus API Key is not set' };
    }

    const response = await fetch(`${LOCUS_API_BASE}/pay/balance`, {
      headers: {
        'Authorization': `Bearer ${LOCUS_API_KEY}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'API_ERROR',
        message: data.message || `Locus API responded with status ${response.status}`
      };
    }
    // The Locus API already returns { success, data } or { success, error }
    return data;
  } catch (error: any) {
    return { success: false, error: 'NETWORK_ERROR', message: error.message };
  }
}

export async function sendPayment(toAddress: string, amount: number, memo: string): Promise<LocusResponse<PayoutData>> {
  try {
    if (!LOCUS_API_KEY) {
      return { success: false, error: 'Configuration Error', message: 'Locus API Key is not set' };
    }

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
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error || 'API_ERROR', message: data.message };
    }
    return data;
  } catch (error: any) {
    return { success: false, error: 'NETWORK_ERROR', message: error.message };
  }
}

export async function sendEscrow(email: string, amount: number, memo: string): Promise<LocusResponse<PayoutData>> {
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
      return {
        success: false,
        error: data.error || 'API_ERROR',
        message: data.message || `Locus API responded with status ${response.status}`
      };
    }

    return data;
  } catch (error: any) {
    return { success: false, error: 'NETWORK_ERROR', message: error.message };
  }
}

export async function createCheckoutSession(params: {
  amount: number | string;
  description: string;
  successUrl: string;
  cancelUrl: string;
  webhookUrl: string;
  metadata?: Record<string, any>;
}): Promise<LocusResponse<{ id: string; checkoutUrl: string; webhookSecret: string }>> {
  try {
    if (!LOCUS_API_KEY) {
      return { success: false, error: 'Configuration Error', message: 'Locus API Key is not set' };
    }

    const response = await fetch(`${LOCUS_API_BASE}/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOCUS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amount.toString(),
        description: params.description,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        webhook_url: params.webhookUrl,
        metadata: params.metadata
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error || 'API_ERROR', message: data.message };
    }

    return {
      success: true,
      data: {
        id: data.data.id || data.data.session_id,
        checkoutUrl: data.data.checkoutUrl || data.data.checkout_url,
        webhookSecret: data.data.webhookSecret || data.data.webhook_secret || data.data.secret || data.data.signing_secret
      }
    };
  } catch (error: any) {
    return { success: false, error: 'NETWORK_ERROR', message: error.message };
  }
}

export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const crypto = require('crypto');
    const expected = 'sha256=' + crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Timing-safe comparison to prevent side-channel attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}
