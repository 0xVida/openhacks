import { Octokit } from "octokit";

export async function getIssueDetails(repoFullName: string, issueNumber: number) {
  try {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN }); // GitHub App token
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
  } catch (error) {
    console.error('Error fetching issue from GitHub:', error);
    return { success: false, error: 'Issue not found or inaccessible.' };
  }
}

export async function checkRepoAccess(repoFullName: string, githubUsername: string): Promise<boolean> {
  try {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const [owner, repo] = repoFullName.split('/');

    const { data: permission } = await octokit.request('GET /repos/{owner}/{repo}/collaborators/{username}/permission', {
      owner,
      repo,
      username: githubUsername
    });

    // 'admin' or 'write' permission is required to be a maintainer
    return permission.permission === 'admin' || permission.permission === 'write';
  } catch (error) {
    console.error('Error checking repo access:', error);
    return false;
  }
}
