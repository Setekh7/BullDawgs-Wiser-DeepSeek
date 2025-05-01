// src/app/api/openai/route.ts
import { NextResponse } from 'next/server';
import { askQuestion } from '@/app/lib/openai';

export async function POST(request: Request) {
  try {
    let message: string;
    let file: File | null = null;
    let extractedCourses: string[] = [];

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      message = formData.get('message') as string;
      file = formData.get('file') as File | null;

      // validate file type
      if (file) {
        // Check if the file is a text file
        if (!file.name.toLowerCase().endsWith('.txt')) {
          return NextResponse.json(
            { error: 'Only .txt files are supported' },
            { status: 400 }
          );
        }
        // Process the file on the server directly
        try {
          const buffer = await file.arrayBuffer();
          const text = new TextDecoder().decode(buffer);
          
          // Extract course codes
          extractedCourses = text
            .split('\n')
            .map(line => line.trim().toUpperCase())
            .filter(line => /^[A-Z]{2,4} \d{3,4}$/.test(line));
            
          console.log("Extracted courses from file:", extractedCourses);
        } catch (fileError) {
          console.error("Error processing file:", fileError);
          return NextResponse.json(
            { error: 'Failed to process file' },
            { status: 400 }
          );
        }
      }
    } else {
      try {
        const jsonBody = await request.json();
        message = jsonBody.message || '';
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError);
        return NextResponse.json(
          { error: 'Invalid JSON in request' },
          { status: 400 }
        );
      }
    }

    // Ensure we have something to process
    if (!message.trim() && extractedCourses.length === 0) {
      return NextResponse.json(
        { error: 'No message or valid course data provided' }, 
        { status: 400 }
      );
    }
    
    // Use default message if needed
    if (!message.trim() && extractedCourses.length > 0) {
      message = "What courses are available?";
    }

    // Pass extracted courses directly to a modified version of askQuestion
    // Or keep using file if your askQuestion function is properly handling server-side files

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