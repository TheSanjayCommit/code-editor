require("dotenv").config();
const Groq = require("groq-sdk");
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert full-stack AI coding assistant.
Your goal is to generate a complete, working project based on the user's prompt.
You must return the result strictly as a valid JSON object.
Do not include any markdown formatting, backticks, or explanations outside the JSON.

Expected JSON Structure:
{
  "projectName": "string",
  "description": "string (brief summary)",
  "files": [
    {
      "path": "path/to/filename.ext",
      "content": "full code content"
    }
  ]
}

Rules:
1. "path" should be a relative path (e.g., "src/App.jsx", "public/index.html").
2. "content" must be valid, production-ready code. Use '\n' for newlines and ensure proper indentation.
3. Include all necessary files to run the project (e.g., package.json, index.html, vite.config.js if needed).
4. Use React for frontend/UI tasks unless specified otherwise.
5. Ensure JSON is valid (escape characters properly).
`;

async function generateProject(prompt) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No content received from AI");

    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating project:", error);
    throw error;
  }
}

module.exports = { generateProject };
