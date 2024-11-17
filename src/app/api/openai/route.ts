// src/app/api/openai/route.ts
import { NextResponse } from 'next/server';
import { askQuestion } from '@/app/lib/openai';

export async function POST(request: Request) {
  try {
    let message: string;
    let file: File | null = null;

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      message = formData.get('message') as string;
      file = formData.get('file') as File | null;
    } else {
      const { message: jsonMessage } = await request.json();
      message = jsonMessage;
    }

    if (!message) {
      return NextResponse.json(
        { error: 'No message provided' }, 
        { status: 400 }
      );
    }

    const answer = await askQuestion(message, file);
    return NextResponse.json({ answer });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' }, 
      { status: 500 }
    );
  }
}