// src/app/lib/openai.ts
// import { writeFileSync } from 'fs';
// import path from 'path';
// import { VectorStores } from 'openai/resources/beta/index.mjs';
import { HfInference } from "@huggingface/inference";
import { courseGraph } from "@/app/lib/CourseGraph";

const client = new HfInference(process.env.HUGGINGFACE_API_KEY! || '');

async function readTextFile(file: File): Promise<string[]> {
    // check if browser environment
    if (typeof window === "undefined") {
        console.error("Server environment detected, using server-side file handling.");
        return handleServerFile(file);
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                // Extract course codes (assuming format: "CSE 1284" per line)
                console.log("File contents: ", reader.result);

                const courses = reader.result
                    .split("\n")
                    .map(line => line.trim().toUpperCase()) // Normalize input
                    .filter(line => /^[A-Z]{2,4} \d{3,4}$/.test(line)); // Basic format validation
                resolve(courses);
            } else {
                reject("Invalid file format.");
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}
// Server-side alternative for file processing
async function handleServerFile(file: File): Promise<string[]> {
    try {
        // On the server, the File object comes as a blob-like object
        // We need to read it differently
        const buffer = await file.arrayBuffer();
        const text = new TextDecoder().decode(buffer);
        
        return text
            .split("\n")
            .map(line => line.trim().toUpperCase())
            .filter(line => /^[A-Z]{2,4} \d{3,4}$/.test(line));
    } catch (error) {
        console.error("Error processing file on server:", error);
        return [];
    }
}
export async function askQuestion(message: string, file: File | null = null): Promise<string> {
    try {
        // instruction
        //const systemPrompt = "You are an academic advisor who recommends courses for software engineering students based on the context provided. Use this information and only this information to provide concise, clear responses to students' questions and requests. Only respond with what is necessary to fulfill the user's request, such as the class numbers of the classes they should take. DO NOT add your thoughts, reasoning, or unnecessary text in your response. Your job is to provide the students with the classes they will take next, which are provided to you.";
        const systemPrompt = `You are an AI academic advisor that ONLY outputs course codes.

OUTPUT FORMAT:
• CSE 1234
• CSE 5678

IMPORTANT RULES:
- NEVER explain your reasoning
- NEVER add introductory text
- NEVER add concluding text
- ONLY respond with bullet points of course codes
- If no courses are available, respond with "No available courses"`;
        let completedCourses: string[] = [];

        // Read the file and extract course codes
        if (file) {
            try {
                completedCourses = await readTextFile(file);
            } catch (fileError) {
                console.error("Error reading file:", fileError);
                //return "Error reading file.";
            }
        }
        // Get advisory context from the course graph
        completedCourses = ["CSE 1284", "CSE 1011"]; // Example completed courses
        const currentYear = 1;
        const availableCourses = courseGraph.getAvailableCourses(completedCourses, currentYear);

        // Create a summary of available courses
        const courseSummary = availableCourses.length > 0 
    ? `The following courses are available:\n• ${availableCourses.map(c => `${c.course} (A Rate: ${c.aRate})`).join("\n• ")}`
    : "There are no available courses for the user.";
        //console.log(availableCourses.length > 0 ? `The following courses are available:\n• ${availableCourses.join("\n• ")}` : "There are no available courses.");
        
        // Delimiter
        let prompt = `${systemPrompt}\n\nContext: ${courseSummary}\n\nUser: ${message}\n\n`;
        if (file) {
            prompt += "User attached file contains additional context.\n";
            /* <-- Process file contents here --> */ 
            prompt += "Classes passed:";
            // using completedCourses
            prompt += `\n• ${completedCourses.join("\n• ")}`;
            //prompt += `\n\n${fileText}`;
        }
        prompt += "\n\nResponse:\n";
        console.log(prompt);

        const output = await client.textGeneration({
            model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
            inputs: prompt,
            provider: "hf-inference",
            parameters: {
              temperature: 0.01,
              max_length: 50,
              repetition_penalty: 1.2,
              return_full_text: false,
              top_p: 0.1,
            },
        });
        
        const cleanedText = output.generated_text
        ? output.generated_text.replace(/<\/think>/g, '')
                              .replace(/<think>/g, '')
                              .replace(/\[.*?\]/g, '') // Optional: removes content in square brackets
                              .trim()
            : "No response received.";

        console.log(cleanedText); 
        return cleanedText;
        
    } catch (error) {
        console.error("Hugging Face API Error:", error);
        throw error;
    }
}
