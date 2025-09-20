// pages/api/list-files.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Storage } from '@google-cloud/storage';

const storage = new Storage({ keyFilename: 'path-to-service-account.json' });
const bucket = storage.bucket('lexi-simplify-uploads-20250827-v9k3');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [files] = await bucket.getFiles();
    const fileNames = files.map(f => f.name);
    res.status(200).json({ files: fileNames });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list files' });
  }
}
