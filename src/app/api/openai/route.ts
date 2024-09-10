// src/app/api/openai/route.ts
import { NextResponse } from 'next/server';
import { askQuestion } from '@/lib/openai';

export async function POST(request: Request) {
  const { question } = await request.json();

  if (!question) {
    return NextResponse.json({ error: 'No question provided' }, { status: 400 });
  }

  try {
    const answer = await askQuestion(question);
    return NextResponse.json({ answer });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch answer' }, { status: 500 });
  }
}
