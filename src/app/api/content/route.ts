import { NextRequest, NextResponse } from 'next/server';
import { readHTMLFile } from '@/utils/htmlReader';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const href = searchParams.get('href');

    if (!href) {
      return NextResponse.json(
        { error: 'Missing href parameter' },
        { status: 400 }
      );
    }

    const content = await readHTMLFile(href);

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error in content API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
