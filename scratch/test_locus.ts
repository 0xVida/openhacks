import { checkBalance } from './src/lib/locus';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  console.log('Testing Locus Balance Fetch...');
  const result = await checkBalance();
  console.log('Result:', JSON.stringify(result, null, 2));
}

test();
