import { auth } from "@/auth";
import { Octokit } from "octokit";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get("repo");

  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!repo) {
    return NextResponse.json({ error: "Repository is required" }, { status: 400 });
  }

  const [owner, repoName] = repo.split("/");

  const octokit = new Octokit({
    auth: (session as any).accessToken,
  });

  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/issues", {
      owner,
      repo: repoName,
      state: "open",
      sort: "updated",
      per_page: 50,
    });

    // Filter out pull requests (GitHub API returns both issues and PRs in the issues endpoint)
    const issues = response.data
      .filter((item: any) => !item.pull_request)
      .map((issue: any) => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body || "",
        url: issue.html_url,
        createdAt: issue.created_at,
        labels: issue.labels.map((l: any) => l.name),
      }));

    return NextResponse.json({ issues });
  } catch (error: any) {
    console.error("Error fetching issues:", error);
    return NextResponse.json({ 
      error: "Failed to fetch issues", 
      details: error.message 
    }, { status: 500 });
  }
}
