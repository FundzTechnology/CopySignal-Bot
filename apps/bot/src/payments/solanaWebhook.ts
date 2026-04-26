import express, { Request, Response } from 'express';
import { handleSolanaPayment } from './solanaPaymentSession.js';

const router = express.Router();

// ── Main Helius Webhook Handler ────────────────────────────────
router.post('/webhook/solana', async (req: Request, res: Response) => {
  // Always respond 200 immediately — Helius retries on timeout
  res.status(200).json({ received: true });

  const transactions: any[] = req.body;
  if (!Array.isArray(transactions)) return;

  for (const tx of transactions) {
    try {
      const signature = tx.signature;
      
      // ── Find USDC transfer ──
      const tokenTransfers: any[] = tx.tokenTransfers || [];
      const usdcTransfer = tokenTransfers.find(
        (t: any) =>
          t.mint === 'DSgSbuu4J4tDFjo7qb98TjtNeDwMHH68CwiKZi66P3Y3'
      );
      if (!usdcTransfer) continue;

      const amountUSDC: number = usdcTransfer.tokenAmount;
      const toAddress = usdcTransfer.toUserAccount;

      // Delegate to the HD wallet session handler
      await handleSolanaPayment(toAddress, amountUSDC, signature);
    } catch (err) {
      console.error('Error processing Solana tx:', err);
    }
  }
});

export default router;
