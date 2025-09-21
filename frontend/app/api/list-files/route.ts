// app/api/list-files/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

const storage = new Storage({ keyFilename: 'service-account.json' });
const bucket = storage.bucket('lexi-simplify-uploads-v4');

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
