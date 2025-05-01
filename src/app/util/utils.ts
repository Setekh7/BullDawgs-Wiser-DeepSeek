import fs from "fs/promises";

export async function readTextFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (error) {
    console.error("Error reading file:", error);
    return "";
  }
}