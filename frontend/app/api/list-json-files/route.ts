
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

    // Return only JSON files
    const jsonFiles = files
      .map(f => f.name)
      .filter(name => name.toLowerCase().endsWith('.json'));

    return NextResponse.json({ files: jsonFiles });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to list JSON files' }, { status: 500 });
  }
}
