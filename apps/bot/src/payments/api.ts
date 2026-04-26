import express, { Request, Response } from 'express';
import { createPaymentSession as createSolanaSession } from './solanaPaymentSession.js';
import { createSuiPaymentSession } from './suiWalletDeriver.js';

const router = express.Router();

router.post('/session', async (req: Request, res: Response) => {
  try {
    const { userId, userIndex, chain, plan } = req.body;

    if (chain === 'solana') {
      const session = await createSolanaSession(userId, userIndex, plan);
      res.json(session);
    } else if (chain === 'sui') {
      const session = await createSuiPaymentSession(userId, userIndex, plan);
      res.json(session);
    } else {
      res.status(400).json({ error: 'Invalid chain' });
    }
  } catch (error) {
    console.error('Failed to create payment session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
