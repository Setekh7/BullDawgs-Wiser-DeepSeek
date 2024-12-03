// src/app/lib/openai.ts
import OpenAI from 'openai';
import { writeFileSync } from 'fs';
import path from 'path';
import { VectorStores } from 'openai/resources/beta/index.mjs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


let threadId: string | null = null;

export async function askQuestion(message: string, file: File | null = null) {
    const assistantID =process.env.OPENAI_ASSISTANT_ID;
  try {

    if (!threadId) {
        const thread = await openai.beta.threads.create();
        threadId = thread.id;
      }

      // Store the current number of messages before adding new one
      const beforeMessages = await openai.beta.threads.messages.list(threadId);
      const beforeCount = beforeMessages.data.length;
    
    if (file) {
      
      
      // Upload the file to OpenAI using the file path
      const uploadedFile = await openai.files.create({
        file: file,
        purpose: 'assistants',
      });

      // Add the message to the thread
      await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: message + " This pdf is my degree works file.",
        attachments: [{
            file_id: uploadedFile.id,
            tools: [{ type: "file_search" }] 
          }]
      });

    } else {



      // Add the message to the thread
      await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: message,
      });

      
    }


    // Run the assistant
    const run = await openai.beta.threads.runs.create(
        threadId, 
        {
        assistant_id: assistantID!, 
      });

      // Poll for the completion
      let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      
      while (runStatus.status !== 'completed') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
        
        if (runStatus.status === 'failed') {
          throw new Error('Assistant run failed');
        }
      }

      // Get messages after the run is complete
      const afterMessages = await openai.beta.threads.messages.list(threadId, {
        order: 'asc',
        limit: 100
    });

    // Find the new assistant message
    const newMessages = afterMessages.data.slice(beforeCount);
    const lastAssistantMessage = newMessages
        .filter(message => message.role === 'assistant')
        .pop();

    if (!lastAssistantMessage) {
        throw new Error('No assistant response found');
    }

    return lastAssistantMessage.content[0]?.text?.value || 'No response received';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}

// Function to reset thread if needed
export async function resetThread() {
    threadId = null;
  }