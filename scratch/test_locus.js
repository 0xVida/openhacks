const LOCUS_API_KEY = 'claw_dev_lBDtAPnciJehJwkJxRElsNsnJMGpxD9V';
const LOCUS_API_BASE = 'https://beta-api.paywithlocus.com/api';

async function test() {
  console.log('Testing Locus Balance Fetch...');
  console.log('Base URL:', LOCUS_API_BASE);
  try {
    const response = await fetch(`${LOCUS_API_BASE}/pay/balance`, {
      headers: {
        'Authorization': `Bearer ${LOCUS_API_KEY}`,
      },
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
