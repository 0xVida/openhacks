import { auth } from "@/auth";
import { Octokit } from "octokit";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const octokit = new Octokit({
    auth: (session as any).accessToken,
  });

  try {
    const response = await octokit.request("GET /user/repos", {
      sort: "updated",
      per_page: 100,
    });

    const repos = response.data.map((repo: any) => ({
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      owner: repo.owner.login,
    }));

    return NextResponse.json({ repos });
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 });
  }
}
