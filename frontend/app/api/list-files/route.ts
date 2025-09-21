import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY!),
});
const bucket = storage.bucket(process.env.FINAL_DB_BUCKET!);

export async function GET() {
  try {
    const [files] = await bucket.getFiles();
    const fileNames = files.map(f => f.name);
    return NextResponse.json({ files: fileNames });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}
