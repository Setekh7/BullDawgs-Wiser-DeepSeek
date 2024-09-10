// src/app/api/chatgpt.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { messages } = req.body;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: messages,
    });

    res.status(200).json({ response: response.data.choices[0].message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
