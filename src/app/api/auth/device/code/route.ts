import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const clientId = process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID;

    if (!clientId) {
      return NextResponse.json({ error: 'GitHub Client ID not configured' }, { status: 500 });
    }

    // Proxy to GitHub's Device Authorization endpoint
    const response = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'OpenHacks-Agent-Onboarding'
      },
      body: JSON.stringify({
        client_id: clientId,
        scope: 'read:user user:email repo'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        error: 'GitHub Error', 
        message: data.error_description || 'Failed to initiate device flow' 
      }, { status: response.status });
    }

    // GitHub returns: device_code, user_code, verification_uri, expires_in, interval
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Device Flow Initiation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
