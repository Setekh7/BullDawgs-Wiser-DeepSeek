// src/app/lib/openai.ts
// import { writeFileSync } from 'fs';
// import path from 'path';
// import { VectorStores } from 'openai/resources/beta/index.mjs';
import { HfInference } from "@huggingface/inference";
import { courseGraph } from "@/app/lib/CourseGraph";

const client = new HfInference(process.env.HUGGINGFACE_API_KEY! || '');

export async function askQuestion(message: string, file: File | null = null): Promise<string> {
    try {
        // instruction
        const systemPrompt = "You are an academic advisor who recommends courses for software engineering students based on the curriculum provided (context), which tells which classes they should take next. Use this information to provide concise, clear responses to students' questions and requests. Only respond with what is necessary to fulfill the user's request, and do not add unnecessary text to your response.";

        // Get advisory context from the course graph
        const completedCourses = ["CSE 1284", "CSE 1011"]; // Example completed courses
        const availableCourses = courseGraph.getAvailableCourses(completedCourses);

        // Create a summary of available courses
        const courseSummary = availableCourses.length > 0 ? `The following courses are available:\n• ${availableCourses.join("\n• ")}` : "There are no available courses for the user.";
        console.log(availableCourses.length > 0 ? `The following courses are available:\n• ${availableCourses.join("\n• ")}` : "There are no available courses.");
        
        // Delimiter
        let prompt = `${systemPrompt}\n\nContext: ${courseSummary}\n\nUser: ${message}\n\n`;
        //if (file) {
            prompt += "User attached file contains additional context.\n";
            /* <-- Process file contents here --> */ 
            prompt += "Classes passed:";
            // using completedCourses
            prompt += `\n• ${completedCourses.join("\n• ")}`;
            //prompt += `\n\n${fileText}`;
        //}
        prompt += "\n\nResponse:\n";
        console.log(prompt);

        const output = await client.textGeneration({
            model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
            inputs: prompt,
            provider: "hf-inference",
            //max_tokens: 500,
            parameters: {
              temperature: 0.1,
              max_length: 100,
              repetition_penalty: 1.2,
              return_full_text: false,
            },
        });

        return output.generated_text || "No response received.";
    } catch (error) {
        console.error("Hugging Face API Error:", error);
        throw error;
    }
}
