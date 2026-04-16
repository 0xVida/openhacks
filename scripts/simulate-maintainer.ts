import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
}

/**
 * OpenHacks Maintainer Agent Simulation - PURE VERSION (No Mocks)
 * 
 * Workflow:
 * 1. Reads platform instructions.
 * 2. Creates a GitHub issue via GH CLI.
 * 3. Registers the bounty on OpenHacks API.
 * 4. Funds the bounty via real Locus REST API.
 * 5. Triggers the internal verification callback.
 */

async function simulateMaintainer() {
    const OPENHACKS_API_KEY = process.env.OPENHACKS_API_KEY;
    const LOCUS_API_KEY = process.env.LOCUS_API_KEY;
    const REPO = process.env.REPO || '0xVida/openhacks';

    const API_BASE = process.env.AUTH_URL ||
        process.env.NEXTAUTH_URL ||
        process.env.NEXT_PUBLIC_URL ||
        'http://localhost:3001';

    const LOCUS_API_BASE = 'https://beta-api.paywithlocus.com/api';

    console.log(`\n--- Maintainer agent workflow (no mocks) ---`);
    console.log(`API_BASE: ${API_BASE}`);
    console.log(`REPO:     ${REPO}`);
    console.log(`OPENHACKS_KEY: ${OPENHACKS_API_KEY ? 'Present' : 'MISSING'}`);
    console.log(`LOCUS_KEY:     ${LOCUS_API_KEY ? 'Present' : 'MISSING'}`);
    console.log(`\n`);

    if (!OPENHACKS_API_KEY || !LOCUS_API_KEY) {
        console.error('Error: Missing OPENHACKS_API_KEY or LOCUS_API_KEY in .env.local');
        process.exit(1);
    }

    console.log('Phase 1: Reading instructions...');
    const skillPath = path.join(process.cwd(), 'public/SKILL.md');
    const skillContent = fs.readFileSync(skillPath, 'utf8');
    console.log('Instructions analyzed. Found Maintainer Workflow.');

    console.log(`\nPhase 2: Creating GitHub Issue in ${REPO}...`);
    const issueTitle = `Agentic Task: ${new Date().getTime()}`;
    const issueBody = "This is an automated task created by the Maintainer agent. Priority: High.";

    let issueNumber: number;
    try {
        const ghOutput = execSync(`gh issue create --title "${issueTitle}" --body "${issueBody}" --repo ${REPO}`, { encoding: 'utf8' });
        const match = ghOutput.match(/\/issues\/(\d+)/);
        if (!match) throw new Error('Failed to parse issue number from gh output.');
        issueNumber = parseInt(match[1], 10);
        console.log(`GitHub Issue created: #${issueNumber}`);
    } catch (error: any) {
        console.error('Error creating GitHub issue:', error.message);
        process.exit(1);
    }

    console.log('\nPhase 3: Registering Bounty on OpenHacks...');
    const registerResponse = await fetch(`${API_BASE}/api/maintainer/bounty`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENHACKS_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            repo: REPO,
            issueNumber: issueNumber,
            reward: 1.00,
            title: issueTitle,
            description: issueBody
        })
    });

    const registerData: any = await registerResponse.json();
    if (!registerResponse.ok) {
        console.error('Registration Failed:', registerData.error);
        if (registerData.message) console.error('Details:', registerData.message);
        process.exit(1);
    }

    const { sessionId, checkoutUrl } = registerData.data.locus;
    const bountyId = registerData.data.bounty.id;
    console.log(`Bounty Registered. Session ID: ${sessionId}`);
    console.log(`Bounty ID:  ${bountyId}`);

    console.log('\nPhase 4: Funding Locus Session (REST API)...');
    const payResponse = await fetch(`${LOCUS_API_BASE}/checkout/agent/pay/${sessionId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${LOCUS_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            payerEmail: 'maintainer-agent@example.com'
        })
    });

    const payData: any = await payResponse.json();
    if (!payResponse.ok) {
        console.error('Funding Failed:', payData.error || payData.message);
        process.exit(1);
    }

    console.log(`Payment Submitted to Locus. Transaction ID: ${payData.data?.transaction_id || 'Success'}`);

    console.log('\nPhase 5: Checking bounty status');
    // We hit the production verification endpoint with the proper Accept header
    const verifyResponse = await fetch(`${API_BASE}/api/locus/verify?bountyId=${bountyId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });

    if (verifyResponse.ok) {
        console.log('was sucessfully funded and status updated');
    } else {
        console.error('funding failed', await verifyResponse.text());
        process.exit(1);
    }

    console.log('\nPhase 6: Verifying final state in Dashboard API...');
    const discoveryResponse = await fetch(`${API_BASE}/api/bounties`);
    const discoveryData: any = await discoveryResponse.json();
    const found = discoveryData.data.find((b: any) => b.id === bountyId);

    if (found && found.status === 'open') {
        console.log('\nSUCCESS: Bounty is fully PROVISIONED and OPEN on the platform.');
    } else {
        console.log('\nFAILURE: Bounty status did not update as expected');
        console.log('Current Bounty Data:', found);
        process.exit(1);
    }
}

simulateMaintainer();
