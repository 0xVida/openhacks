import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
}

/**
 * OpenHacks Maintainer Agent Simulation
 * 
 * Workflow:
 * 1. Reads platform instructions.
 * 2. Creates a GitHub issue.
 * 3. Registers the bounty on OpenHacks.
 * 4. Funds the bounty via the Locus API.
 */

async function simulateMaintainer() {
    const OPENHACKS_API_KEY = process.env.OPENHACKS_API_KEY;
    const LOCUS_API_KEY = process.env.LOCUS_API_KEY;
    const REPO = process.env.REPO || '0xVida/openhacks';
    const API_BASE = process.env.NEXT_PUBLIC_URL || 'http://localhost:3001';
    const LOCUS_API_BASE = 'https://beta-api.paywithlocus.com/api';

    console.log(`\n--- Simulation Context ---`);
    console.log(`API_BASE: ${API_BASE}`);
    console.log(`REPO:     ${REPO}`);
    console.log(`OPENHACKS_KEY: ${OPENHACKS_API_KEY ? 'Present' : 'MISSING'}`);
    console.log(`LOCUS_KEY:     ${LOCUS_API_KEY ? 'Present' : 'MISSING'}`);
    console.log(`--------------------------\n`);

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
    const issueBody = "This is an automated task created by the Maintainer Simulation agent. Priority: High.";

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
            reward: 1.00
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
    console.log(`Checkout URL: ${checkoutUrl}`);

    console.log('\nPhase 4: Funding Locus Session...');
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

    console.log(`Payment Submitted. Transaction ID: ${payData.data?.transaction_id || 'Pending'}`);

    console.log('\nPhase 4.5: Simulating Locus Webhook Confirmation (Local Development)...');
    const webhookPayload = JSON.stringify({
        event: 'checkout.session.paid',
        data: { sessionId }
    });

    const webhookResponse = await fetch(`${API_BASE}/api/webhooks/locus`, {
        method: 'POST',
        headers: {
            'x-signature-256': 'local-sim', // Placeholder
            'Content-Type': 'application/json'
        },
        body: webhookPayload
    });

    if (webhookResponse.ok) {
        console.log('Local Webhook Simulation: SUCCESS (Bounty funding confirmed)');
    } else {
        console.error('Local Webhook Simulation: FAILED', await webhookResponse.text());
    }

    console.log('\nPhase 5: Polling for funding confirmation...');
    let isFunded = false;
    for (let i = 0; i < 10; i++) {
        process.stdout.write('.');
        await new Promise(r => setTimeout(r, 3000));

        const discoveryResponse = await fetch(`${API_BASE}/api/bounties`);
        const discoveryData: any = await discoveryResponse.json();

        const found = discoveryData.data.find((b: any) => b.id === bountyId);
        if (found) {
            isFunded = true;
            console.log('\nSUCCESS: Bounty is now FUNDED and ACTIVE.');
            break;
        }
    }

    if (!isFunded) {
        console.log('\nTimeout: Bounty is still pending. Check the Locus webhook status.');
    }
}

simulateMaintainer();
