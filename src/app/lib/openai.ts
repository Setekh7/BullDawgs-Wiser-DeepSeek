// src/app/lib/openai.ts
import OpenAI from "openai";
import { courseGraph } from "@/app/lib/CourseGraph";

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});


async function readTextFile(file: File): Promise<string[]> {
    // check if browser environment
    if (typeof window === "undefined") {
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
export async function askQuestion(userMessage: string, file: File | null = null): Promise<string> {
    try {
        const systemMessage = `
            You are an AI academic advisor. Your job is to recommend what courses the user should take next based on the courses they've already completed and what is available to them.

            If no courses are available, respond with "No available courses".`;
            // `
            // You are an AI academic advisor. Your job is to recommend what courses the user should take next based on the courses they've already completed and what is available to them.

            // You must include a list of bullet-pointed course codes (like: • CSE 2213) in your response.

            // If no courses are available, respond with "No available courses".

            // DO NOT explain your reasoning, add greetings, or include additional information.`;
        let completedCourses: string[] = [];
        // Read the file and extract course codes
        if (file) {
            completedCourses = await readTextFile(file);
        }
        // Get advisory context from the course graph
        const currentYear = 1;
        const availableCourses = courseGraph.getAvailableCourses(completedCourses, currentYear);
        const availableCourseCodes = availableCourses.map(c => c.course);
        const availableSummary = availableCourseCodes.length
          ? `• ${availableCourseCodes.join("\n• ")}`
          : "No available courses";

        const userText = userMessage?.trim() || "What courses should I take next?";

        const contextMsg = `The user has completed the following courses:\n• ${completedCourses.join("\n• ")}\n\nBased on the curriculum, the available next courses are:\n${availableSummary}`;

        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            { role: "system", content: systemMessage.trim() },
            { role: "user", content: `${contextMsg}\n\nUser question: ${userText}` }
          ];
      
          const response = await openai.chat.completions.create({
            model: "gpt-4-1106-preview",
            messages,
            temperature: 0.3,
            top_p: 0.8,
            max_tokens: 200,
          });
      
          const output = response.choices[0]?.message?.content?.trim() || "No response received.";
          console.log("Response:", output);
          return output;
      
        } catch (err) {
          console.error("Error in askQuestion:", err);
          return "An error occurred while processing your request.";
        }
}
