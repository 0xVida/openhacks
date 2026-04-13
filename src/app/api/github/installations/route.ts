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
    // List installations for the authenticated user
    const response = await octokit.request("GET /user/installations", {
      per_page: 100,
    });

    const installations = response.data.installations.map((inst: any) => ({
      id: inst.id,
      account: inst.account.login,
      app_id: inst.app_id,
      repository_selection: inst.repository_selection,
    }));

    return NextResponse.json({ installations });
  } catch (error) {
    console.error("Error fetching installations:", error);
    return NextResponse.json({ error: "Failed to fetch installations" }, { status: 500 });
  }
}
