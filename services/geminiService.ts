import { GoogleGenAI, Content, Part } from "@google/genai";
const secrectKey = localStorage.getItem("GEMINI_API_KEY") || process.env.GEMINI_API_KEY 
;
const ai = new GoogleGenAI({ apiKey: secrectKey });

// System instruction to guide the model's persona and output format
const SYSTEM_INSTRUCTION = `
You are an elite Senior React Frontend Engineer and UI/UX Specialist. 
Your goal is to accept an image of a UI design (Figma screenshot) and generate a pixel-perfect, production-ready React component that replicates it.

**Visual Fidelity & Responsiveness (CRITICAL):**
- **Match the design EXACTLY.** Pay close attention to spacing, padding, margins, and font sizes.
- **Responsive Design:** The component MUST be fully responsive. Use Tailwind's responsive prefixes (e.g., \`md:flex-row\`, \`lg:p-8\`, \`w-full\`, \`max-w-7xl mx-auto\`) to ensure it looks great on mobile, tablet, and desktop.
- **Colors:** Estimate hex codes as precisely as possible. Use arbitrary tailwind values like \`bg-[#3b82f6]\` if needed.
- **Layout:** Use precise Flexbox/Grid layouts. Analyze alignment carefully.
- **Typography:** Use 'font-sans' (Inter) or 'font-mono' (JetBrains Mono) appropriately.
- **Background:** Include a wrapper \`div\` with \`min-h-screen\`, \`w-full\`, and the **exact background color** of the design.

**Technical Stack Rules:**
- **React 18+ with TypeScript.**
- **Tailwind CSS** for all styling.
- **Lucide React** for icons. 
- **Standard Imports:** You MUST include all necessary imports.
    - \`import React, { useState, ... } from 'react';\`
    - \`import { ... } from 'lucide-react';\`
- **Single File:** Output the entire component in a single file. If you need helper components, define them within the same file (e.g., at the bottom).
- **Export:** Use \`export default function ComponentName() { ... }\`.

**Output Format:**
- Stream your thought process first as plain text log entries.
- Then, output the code inside a single markdown block starting with \`\`\`tsx.
- **ONLY output ONE code block.**
`;

export async function* streamComponentGeneration(
  prompt: string,
  modelName: string,
  imageBase64?: string,
  history: Content[] = []
) {
  const parts: Part[] = [];

  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/png",
        data: imageBase64,
      },
    });
  }

  parts.push({ text: prompt });
console.log("modelName",modelName);
  const chat = ai.chats.create({
    model: modelName,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.1, // Lower temperature for high precision
    },
    history: history,
  });

  const resultStream = await chat.sendMessageStream({
    message: { parts },
  });

  for await (const chunk of resultStream) {
    yield chunk.text;
  }
}


// import OpenAI from "openai";

// // Load API key from localStorage
// const secrectKey = process.env.GEMINI_API_KEY 
// console.log("secrectKey",secrectKey);
// // Create OpenAI client
// const ai = new OpenAI({
//   apiKey: process.env.OPEN_AI_KEY ,
//   dangerouslyAllowBrowser: true,
// });

// // System instruction (UNCHANGED)
// const SYSTEM_INSTRUCTION = `
// You are an elite Senior React Frontend Engineer and UI/UX Specialist. 
// Your goal is to accept an image of a UI design (Figma screenshot) and generate a pixel-perfect, production-ready React component that replicates it.

// **Visual Fidelity & Responsiveness (CRITICAL):**
// - **Match the design EXACTLY.** Pay close attention to spacing, padding, margins, and font sizes.
// - **Responsive Design:** The component MUST be fully responsive. Use Tailwind's responsive prefixes (e.g., \`md:flex-row\`, \`lg:p-8\`, \`w-full\`, \`max-w-7xl mx-auto\`) to ensure it looks great on mobile, tablet, and desktop.
// - **Colors:** Estimate hex codes as precisely as possible. Use arbitrary tailwind values like \`bg-[#3b82f6]\` if needed.
// - **Layout:** Use precise Flexbox/Grid layouts. Analyze alignment carefully.
// - **Typography:** Use 'font-sans' (Inter) or 'font-mono' (JetBrains Mono) appropriately.
// - **Background:** Include a wrapper \`div\` with \`min-h-screen\`, \`w-full\`, and the **exact background color** of the design.

// **Technical Stack Rules:**
// - **React 18+ with TypeScript.**
// - **Tailwind CSS** for all styling.
// - **Lucide React** for icons. 
// - **Standard Imports:** You MUST include all necessary imports.
//     - \`import React, { useState, ... } from 'react';\`
//     - \`import { ... } from 'lucide-react';\`
// - **Single File:** Output the entire component in a single file. If you need helper components, define them within the same file (e.g., at the bottom).
// - **Export:** Use \`export default function ComponentName() { ... }\`.

// **Output Format:**
// - Stream your thought process first as plain text log entries.
// - Then, output the code inside a single markdown block starting with \`\`\`tsx.
// - **ONLY output ONE code block.**
// `;

// // STREAM FUNCTION — SAME LOGIC, just OpenAI API format
// export async function* streamComponentGeneration(
//   prompt: string,
//   modelName: string,
//   imageBase64?: string,
//   history: any[] = []
// ) {
//   const messages: any[] = [];

//   // Add system instruction
//   messages.push({
//     role: "system",
//     content: SYSTEM_INSTRUCTION,
//   });

//   // Add history
//   history.forEach((h) => {
//     messages.push({
//       role: h.role || "user",
//       content: h.parts?.[0]?.text || "",
//     });
//   });

//   // Build user message
//   const userContent: any[] = [];

//   if (imageBase64) {
//     userContent.push({
//       type: "image_url",
//       image_url: {
//         url: `data:image/png;base64,${imageBase64}`,
//       },
//     });
//   }

//   userContent.push({
//     type: "text",
//     text: prompt,
//   });

//   messages.push({
//     role: "user",
//     content: userContent,
//   });
// console.log("modelName")
//   // Start streaming from OpenAI
//   const stream = await ai.chat.completions.create({
//     model: modelName, // pass selected model
//     messages,
//     temperature: 0.1,
//     stream: true,
//   });

//   // yield tokens
//   for await (const chunk of stream) {
//     const delta = chunk.choices?.[0]?.delta?.content;
//     if (delta) yield delta;
//   }
// }
