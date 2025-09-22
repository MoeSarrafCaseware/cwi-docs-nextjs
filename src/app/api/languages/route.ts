import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const configPath = path.join(process.cwd(), 'src', 'content', 'language-config.json');
    
    if (!fs.existsSync(configPath)) {
      return NextResponse.json({ error: 'Language configuration not found' }, { status: 404 });
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error loading language configuration:', error);
    return NextResponse.json({ error: 'Failed to load language configuration' }, { status: 500 });
  }
}
