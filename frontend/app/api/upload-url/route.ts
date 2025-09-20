import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const bucket = storage.bucket(process.env.FINAL_DB_BUCKET!);

export async function GET(req: NextRequest) {
  console.log("Bucket env var:", process.env.FINAL_DB_BUCKET);
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('filename');
  const contentType = searchParams.get('contentType');

  if (!filename || !contentType) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  // sanitize filename
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  const file = bucket.file(sanitizedFilename);

  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
  });

  return NextResponse.json({ url });
}
