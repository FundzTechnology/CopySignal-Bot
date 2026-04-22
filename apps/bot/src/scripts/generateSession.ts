/**
 * Run this script ONCE to generate a Telegram session string.
 * After running, copy the session string output into TELEGRAM_SESSION in your .env
 *
 * Run: npx ts-node --esm src/scripts/generateSession.ts
 */
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import * as readline from "readline";
import * as dotenv from "dotenv";
dotenv.config();

const apiId = parseInt(process.env.TELEGRAM_API_ID!);
const apiHash = process.env.TELEGRAM_API_HASH!;
const session = new StringSession("");

// Simple readline-based input (avoids needing the 'input' npm package)
function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

(async () => {
  console.log("🔐 Telegram Session Generator");
  console.log("─────────────────────────────────");
  console.log("This will log in as your Telegram account.");
  console.log("Your session string will be displayed — keep it secret!\n");

  if (!apiId || !apiHash) {
    console.error("❌ TELEGRAM_API_ID and TELEGRAM_API_HASH must be set in your .env file first.");
    process.exit(1);
  }

  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await ask("📱 Enter your phone number (with country code, e.g. +1234567890): "),
    password: async () => await ask("🔑 Enter your 2FA password (press Enter if none): "),
    phoneCode: async () => await ask("📩 Enter the verification code sent to your Telegram: "),
    onError: (err: Error) => {
      console.error("❌ Error:", err.message);
    },
  });

  console.log("\n✅ SUCCESS! Copy this session string into your apps/bot/.env file:");
  console.log("─────────────────────────────────");
  console.log(`TELEGRAM_SESSION=${client.session.save()}`);
  console.log("─────────────────────────────────\n");

  await client.disconnect();
  process.exit(0);
})();
