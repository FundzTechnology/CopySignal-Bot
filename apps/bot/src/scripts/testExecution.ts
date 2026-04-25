import { encrypt } from '../utils/crypto.js';
import { executeBybit } from '../executors/bybitExecutor.js';
import { parseSignal } from '../parser/signalParser.js';

const testSignal = `BTC Long $30,000 TP $31,000 SL $29,500 x10`;
const parsed = parseSignal(testSignal);
console.log("Parsed:", parsed);

const testApiKey = {
  api_key: encrypt("Tf0IJYZmgIQRnFepch"),
  api_secret: encrypt("DIvGIOILRnUNxusRCiZQ7KrWaFrwl4ze0aWR"),
  testnet: true
};

async function runTest() {
  console.log("Executing test trade on Bybit Testnet...");
  const result = await executeBybit(testApiKey, parsed, 1.0);
  console.log("Execution result:", result);
}

runTest().catch(console.error);
