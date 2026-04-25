import { Cocobase } from "cocobase";

// Singleton pattern — one instance for the whole app
let client: Cocobase | null = null;

export function getDB(): Cocobase {
  if (!client) {
    client = new Cocobase({
      apiKey: process.env.NEXT_PUBLIC_COCOBASE_API_KEY!,
      projectId: process.env.NEXT_PUBLIC_COCOBASE_PROJECT_ID
    });
  }
  return client;
}

export const db = getDB();
