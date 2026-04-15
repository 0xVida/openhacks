import { Octokit, App } from "octokit";

/**
 * Gets an Octokit instance authenticated as the GitHub App for a specific installation.
 */
async function getInstallationOctokit(repoFullName: string) {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const [owner, repo] = repoFullName.split('/');

  if (!appId || !privateKey) {
    throw new Error('GITHUB_APP_ID or GITHUB_APP_PRIVATE_KEY is not configured.');
  }

  const app = new App({ appId, privateKey });
  
  try {
    const { data: installation } = await app.octokit.request("GET /repos/{owner}/{repo}/installation", {
      owner,
      repo,
    });
    return await app.getInstallationOctokit(installation.id);
  } catch (error: any) {
    console.error(`Error getting installation for ${repoFullName}:`, error.message);
    throw new Error(`GitHub App not installed on repository ${repoFullName}`);
  }
}

export async function getIssueDetails(repoFullName: string, issueNumber: number) {
  try {
    const octokit = await getInstallationOctokit(repoFullName);
    const [owner, repo] = repoFullName.split('/');

    const response = await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}', {
      owner,
      repo,
      issue_number: issueNumber,
    });

    return {
      success: true,
      title: response.data.title,
      description: response.data.body || ""
    };
  } catch (error: any) {
    console.error('Error fetching issue from GitHub:', error.message);
    return { success: false, error: error.message || 'Issue not found or inaccessible.' };
  }
}

export async function checkRepoAccess(repoFullName: string, githubUsername: string): Promise<boolean> {
  try {
    const octokit = await getInstallationOctokit(repoFullName);
    const [owner, repo] = repoFullName.split('/');

    const { data: permission } = await octokit.request('GET /repos/{owner}/{repo}/collaborators/{username}/permission', {
      owner,
      repo,
      username: githubUsername
    });

    // 'admin' or 'write' permission is required to be a maintainer
    return permission.permission === 'admin' || permission.permission === 'write';
  } catch (error: any) {
    console.error('Error checking repo access:', error.message);
    return false;
  }
}
