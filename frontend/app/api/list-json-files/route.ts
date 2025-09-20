// app/api/list-json-files/route.ts
import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

const storage = new Storage({ keyFilename: 'service-account.json' });
const bucket = storage.bucket('lexi-simplify-uploads-v4');

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
