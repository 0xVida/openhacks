import fs from 'fs';
import path from 'path';

export interface Bounty {
  id: string;
  title: string;
  description: string;
  repo: string; // owner/repo
  issueNumber: number;
  reward: number;
  status: 'open' | 'processing' | 'merged' | 'paid';
  locusEscrowId?: string;
  contributorGithub?: string;
  contributorWallet?: string;
}

const DATA_FILE = path.join(process.cwd(), 'src/data/bounties.json');

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

export function getBounties(): Bounty[] {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading bounties data:', e);
    return [];
  }
}

export function saveBounties(bounties: Bounty[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(bounties, null, 2));
  } catch (e) {
    console.error('Error saving bounties data:', e);
  }
}

export function addBounty(bounty: Bounty) {
  const bounties = getBounties();
  bounties.push(bounty);
  saveBounties(bounties);
}

export function findBountyByIssue(repo: string, issueNumber: number): Bounty | undefined {
  const bounties = getBounties();
  return bounties.find(b => b.repo.toLowerCase() === repo.toLowerCase() && b.issueNumber === issueNumber);
}

export function updateBountyStatus(id: string, status: Bounty['status'], contributorGithub?: string) {
  const bounties = getBounties();
  const index = bounties.findIndex(b => b.id === id);
  if (index !== -1) {
    bounties[index].status = status;
    if (contributorGithub) {
      bounties[index].contributorGithub = contributorGithub;
    }
    saveBounties(bounties);
    return bounties[index];
  }
  return undefined;
}
