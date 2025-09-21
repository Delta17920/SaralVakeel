// app/api/fetch-json/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY!),
});
const bucket = storage.bucket(process.env.FINAL_DB_BUCKET!);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Missing filename' }, { status: 400 });
  }

  // Only allow JSON files
  if (!filename.toLowerCase().endsWith('.json')) {
    return NextResponse.json({ error: 'File is not JSON' }, { status: 400 });
  }

  const file = bucket.file(filename);

  try {
    const [contents] = await file.download();
    const text = contents.toString('utf-8');

    try {
      const jsonData = JSON.parse(text);
      return NextResponse.json({ data: jsonData });
    } catch {
      return NextResponse.json({ error: 'File is not valid JSON' }, { status: 400 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}
