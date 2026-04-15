import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
}

/**
 * OpenHacks Contributor Agent Simulation
 * 
 * Workflow:
 * 1. Discovers funded bounties.
 * 2. Forks and clones the repository.
 * 3. Simulates a fix.
 * 4. Submits a Pull Request.
 */

async function simulateContributor() {
    const API_BASE = process.env.NEXT_PUBLIC_URL || 'http://localhost:3001';
    const TEST_DIR = path.join(process.cwd(), 'temp_simulation');

    console.log(`\n--- Simulation Context ---`);
    console.log(`API_BASE: ${API_BASE}`);
    console.log(`TEST_DIR: ${TEST_DIR}`);
    console.log(`--------------------------\n`);
    console.log('Phase 1: Discovering funded bounties...');
    const discoveryResponse = await fetch(`${API_BASE}/api/bounties`);
    const discoveryData: any = await discoveryResponse.json();

    if (!discoveryData.success || discoveryData.data.length === 0) {
        console.log('No funded bounties discovered. Run the Maintainer simulation first!');
        process.exit(0);
    }

    const bounty = discoveryData.data[0];
    console.log(`Found Bounty: "${bounty.title}" (#${bounty.issue_number} in ${bounty.repo_fullname})`);
    console.log(`Reward: ${bounty.reward_amount} USDC`);

    console.log(`\nPhase 2: Forking and Cloning ${bounty.repo_fullname}...`);
    if (fs.existsSync(TEST_DIR)) {
        fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TEST_DIR);

    try {
        execSync(`gh repo fork ${bounty.repo_fullname} --clone -- ${TEST_DIR}`, { stdio: 'inherit' });
    } catch (error: any) {
        console.error('Error forking/cloning:', error.message);
        console.log('Falling back to direct clone for simulation purposes...');
        execSync(`git clone https://github.com/${bounty.repo_fullname}.git ${TEST_DIR}`, { stdio: 'inherit' });
    }

    console.log('\nPhase 3: Simulating a Fix...');
    const branchName = `fix-issue-${bounty.issue_number}-${new Date().getTime()}`;
    execSync(`git checkout -b ${branchName}`);
    
    const fixFilePath = path.join(TEST_DIR, 'CONTRIBUTOR_FIX.md');
    fs.writeFileSync(fixFilePath, `# Fix for Issue #${bounty.issue_number}\n\nResolved the problem defined in the issue.`);

    execSync('git add .');
    execSync(`git commit -m "Fix for #${bounty.issue_number} - OpenHacks Simulation"`);

    console.log(`\nPhase 4: Submitting Pull Request for issue #${bounty.issue_number}...`);
    try {
        console.log(`Pushing branch ${branchName}...`);
        execSync(`git push -u origin ${branchName}`, { stdio: 'inherit' });

        console.log('Creating PR on GitHub...');
        const prBody = `This is an automated fix for #${bounty.issue_number}.\n\nFixes #${bounty.issue_number} (OpenHacks Auto Payout Test)`;
        const prOutput = execSync(`gh pr create --title "Fix for #${bounty.issue_number}" --body "${prBody}" --head ${branchName}`, { encoding: 'utf8' });
        
        console.log(`\nSUCCESS: PR Created!`);
        console.log(`URL: ${prOutput.trim()}`);
        console.log(`\nNext Step: Go to the URL above and MERGE the PR to trigger the automated ${bounty.reward_amount} USDC payout.`);
    } catch (error: any) {
        console.error('Error Automating PR:', error.message);
        console.log('\nManual Step Required: You might need to push the branch and run "gh pr create" manually.');
    }
}

simulateContributor();
