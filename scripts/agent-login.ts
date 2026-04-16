import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3001';

async function simulateAgentLogin() {
  console.log("\nStarting Agent Onboarding...\n");

  try {
    console.log("Requesting device code from OpenHacks...");
    const initRes = await fetch(`${BASE_URL}/api/auth/device/code`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });

    const initData = await initRes.json();

    if (!initRes.ok) {
      console.error("Error initiating flow:", initData);
      process.exit(1);
    }

    const { user_code, device_code, verification_uri, interval = 5 } = initData;

    try {
      const { exec } = await import('child_process');
      const platform = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      exec(`${platform} ${verification_uri}`);
    } catch (e) {
      // Fallback if exec fails
    }

    console.log("------------------------------------------------------------");
    console.log("Initiation Successful");
    console.log(`Visit: ${verification_uri}`);
    console.log(`Code: \x1b[1m\x1b[32m${user_code}\x1b[0m`);
    console.log("------------------------------------------------------------\n");

    console.log("Waiting for authorization...");

    const pollInterval = interval * 1000;

    while (true) {
      process.stdout.write(".");

      const pollRes = await fetch(`${BASE_URL}/api/auth/device/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ device_code })
      });

      const pollData = await pollRes.json();

      if (pollData.success) {
        console.log("\n\nAuthentication Successful");
        console.log("------------------------------------------------------------");
        console.log("Profile Summary:");
        console.log(JSON.stringify(pollData.profile, null, 2));
        console.log("------------------------------------------------------------");
        console.log("\x1b[32mAPI Key provisioned and ready for use.\x1b[0m\n");
        break;
      }

      if (pollData.error && pollData.error !== 'authorization_pending') {
        console.log("\n\nError during polling:", pollData);
        process.exit(1);
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

  } catch (error) {
    console.error("\n\nTechnical error during onboarding:", error);
    process.exit(1);
  }
}

simulateAgentLogin();
