import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

const storage = new Storage({ keyFilename: 'D:/law-proj/SaralVakeel/backend/services/document-query/query.json' });
const bucket = storage.bucket('lexi-simplify-uploads-20250827-v9k3');

export async function GET(req: NextRequest) {
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
