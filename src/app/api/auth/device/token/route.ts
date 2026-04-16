import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const clientId = process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'GitHub credentials not configured' }, { status: 500 });
    }

    const { device_code } = await request.json();

    if (!device_code) {
      return NextResponse.json({ error: 'Missing device_code' }, { status: 400 });
    }

    // 1. Exchange device_code for access_token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'OpenHacks-Agent-Onboarding'
      },
      body: JSON.stringify({
        client_id: clientId,
        device_code: device_code,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
      })
    });

    const tokenData = await tokenResponse.json();

    // GitHub returns error: "authorization_pending" if user hasn't approved yet
    if (tokenData.error) {
      return NextResponse.json(tokenData, { status: 200 }); // Keep returning 200 for polling
    }

    const accessToken = tokenData.access_token;
    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to retrieve access token' }, { status: 500 });
    }

    // 2. Fetch GitHub Profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'OpenHacks-Agent-Onboarding'
      }
    });

    const ghUser = await userResponse.json();

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch GitHub profile' }, { status: 500 });
    }

    // 2.5 Fetch Primary Email
    let email = ghUser.email;
    try {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'OpenHacks-Agent-Onboarding'
        },
      });

      if (emailRes.ok) {
        const emails = await emailRes.json();
        const primaryEmail = emails.find((e: any) => e.primary && e.verified);
        if (primaryEmail) {
          email = primaryEmail.email;
        } else {
          email = emails.find((e: any) => e.verified)?.email || emails[0]?.email || email;
        }
      }
    } catch (e) {
      // Silent catch for email fetch error
    }

    // 3. Detect Role (Check for App Installations)
    const instResponse = await fetch('https://api.github.com/user/installations', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'OpenHacks-Agent-Onboarding'
      }
    });

    let role: 'maintainer' | 'contributor' = 'contributor';
    if (instResponse.ok) {
      const instData = await instResponse.json();
      if (instData.total_count > 0) {
        role = 'maintainer';
      }
    }

    // 4. Upsert Profile into OpenHacks DB
    // We generate a fresh API key if they don't have one
    const profile = await db.upsertProfile({
      username: ghUser.login,
      full_name: ghUser.name || ghUser.login,
      avatar_url: ghUser.avatar_url,
      email: email,
      role: role
    });

    if (!profile) {
      return NextResponse.json({ error: 'Database upsert failed' }, { status: 500 });
    }

    // Success! Return the full profile with the API Key
    return NextResponse.json({
      success: true,
      profile: {
        username: profile.username,
        email: profile.email,
        role: profile.role,
        reputation: profile.reputation,
        api_key: profile.api_key
      }
    });

  } catch (error: any) {
    console.error('Device Flow Provisioning Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
