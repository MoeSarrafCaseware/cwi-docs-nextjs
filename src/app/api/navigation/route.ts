import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const navPath = path.join(process.cwd(), 'src', 'content', 'sidebar-navigation.json');
    
    if (!fs.existsSync(navPath)) {
      return NextResponse.json({ error: 'Default navigation not found' }, { status: 404 });
    }

    const navigation = JSON.parse(fs.readFileSync(navPath, 'utf8'));
    return NextResponse.json(navigation);
  } catch (error) {
    console.error('Error loading default navigation:', error);
    return NextResponse.json({ error: 'Failed to load navigation' }, { status: 500 });
  }
}
