# GitHub App Setup for OpenHacks

To enable automated bounty tracking and payouts, you need to create a GitHub App and configure it with your OpenHacks instance.

## 1. Create the App on GitHub
1.  Go to your **GitHub Settings** > **Developer settings** > **GitHub Apps**.
2.  Click **New GitHub App**.
3.  **App Name**: `OpenHacks-[YourName]`
4.  **Homepage URL**: Your production URL (e.g., `https://openhacks.vercel.app`)
5.  **Callback URL**: `https://openhacks.vercel.app/api/auth/callback/github`
6.  **Webhook URL**: `https://openhacks.vercel.app/api/webhooks/github` (Ensure this points to your deployed endpoint).

## 2. Permissions
Under the **Permissions & events** tab, set the following:

- **Repository permissions**:
  - **Issues**: Read & write (to track and label issues).
  - **Pull requests**: Read & write (to detect merges and link to issues).
  - **Metadata**: Read-only (required for all apps).
  - **Contents**: Read-only (to check code if needed).

- **Subscribe to events**:
  - `Pull request`
  - `Issues`
  - `Issue comment`

## 3. Environment Variables
Once created, generate a **Private Key** and a **Client Secret**. Add these to your `.env.local`:

```env
GITHUB_APP_ID="[App ID]"
GITHUB_APP_PRIVATE_KEY="[The content of your .pem file]"
GITHUB_CLIENT_ID="[Client ID]"
GITHUB_CLIENT_SECRET="[Client Secret]"
GITHUB_WEBHOOK_SECRET="[Your chosen webhook secret]"

# Locus Payment Key (from Locus dashboard)
LOCUS_API_KEY="[Your Locus API Key]"
```

## 4. How it works
OpenHacks listens for `pull_request` merged events. When a PR is merged that contains a reference like `Closes #123` in its description, our backend:
1.  Identifies the bounty associated with issue #123.
2.  Fetches the bounty funds from the Locus escrow.
3.  Triggers a payout to the PR author's associated wallet address.
