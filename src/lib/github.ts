import { Octokit } from "octokit";

export async function getIssueDetails(repoFullName: string, issueNumber: number) {
  try {
    // For now, we utilize an unauthenticated Octokit to fetch public issue data.
    // In a full production environment, this would use a GitHub App Installation Token.
    const octokit = new Octokit();
    
    const [owner, repo] = repoFullName.split('/');
    
    const response = await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}', {
      owner,
      repo,
      issue_number: issueNumber,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    return {
      success: true,
      title: response.data.title,
      description: response.data.body || ""
    };
  } catch (error) {
    console.error('Error fetching issue from GitHub:', error);
    return {
      success: false,
      error: 'Could not fetch issue details. Ensure the repository and issue number are correct and public.'
    };
  }
}
