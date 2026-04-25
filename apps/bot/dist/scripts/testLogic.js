import { encrypt, decrypt } from '../utils/crypto.js';
import { calculatePositionSize, isSafeToTrade } from '../utils/riskCalc.js';
console.log("=== Testing Crypto ===");
const secret = "my_super_secret_api_key_123";
const encrypted = encrypt(secret);
const decrypted = decrypt(encrypted);
console.log("Original:", secret);
console.log("Encrypted:", encrypted);
console.log("Decrypted:", decrypted);
console.log("Crypto OK:", secret === decrypted);
console.log("\n=== Testing Risk Calc ===");
const sizing = calculatePositionSize({
    accountBalance: 1000,
    riskPercent: 2, // $20 risk
    entryPrice: 30000,
    stopLossPrice: 29000, // $1000 stop distance
    leverage: 10
});
// $20 / 1000 = 0.02 BTC
console.log("Position Sizing:", sizing);
console.log("Safe to trade?", isSafeToTrade(sizing, 1000));
const sizingRisky = calculatePositionSize({
    accountBalance: 1000,
    riskPercent: 2, // $20 risk
    entryPrice: 30000,
    stopLossPrice: 29900, // $100 stop distance -> $20/100 = 0.2 BTC ($6000 position) -> $600 margin (6% of balance)
    leverage: 10
});
console.log("\nRisky Position Sizing:", sizingRisky);
console.log("Safe to trade? (Should be false, margin > 5%):", isSafeToTrade(sizingRisky, 1000));
//# sourceMappingURL=testLogic.js.map