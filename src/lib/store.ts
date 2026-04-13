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

// Maintainers Management
export interface Maintainer {
  login: string;
  repos: string[]; // List of full names i.e. "owner/repo"
}

const MAINTAINERS_FILE = path.join(process.cwd(), 'src/data/maintainers.json');

// Ensure maintainers file exists
if (!fs.existsSync(MAINTAINERS_FILE)) {
  fs.writeFileSync(MAINTAINERS_FILE, JSON.stringify([]));
}

export function getMaintainers(): Maintainer[] {
  try {
    const data = fs.readFileSync(MAINTAINERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading maintainers data:', e);
    return [];
  }
}

export function saveMaintainers(maintainers: Maintainer[]) {
  try {
    fs.writeFileSync(MAINTAINERS_FILE, JSON.stringify(maintainers, null, 2));
  } catch (e) {
    console.error('Error saving maintainers data:', e);
  }
}

export function addMaintainerRepo(login: string, repoFullName: string) {
  const maintainers = getMaintainers();
  const index = maintainers.findIndex(m => m.login.toLowerCase() === login.toLowerCase());
  
  if (index !== -1) {
    if (!maintainers[index].repos.includes(repoFullName)) {
      maintainers[index].repos.push(repoFullName);
    }
  } else {
    maintainers.push({
      login: login.toLowerCase(),
      repos: [repoFullName]
    });
  }
  
  saveMaintainers(maintainers);
}

export function getMaintainer(login: string): Maintainer | undefined {
  const maintainers = getMaintainers();
  return maintainers.find(m => m.login.toLowerCase() === login.toLowerCase());
}
