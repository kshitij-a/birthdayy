
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { BirthdayData, INITIAL_DATA, Memory, Wish } from '../types';

// Initialize the client. The key MUST be in process.env.API_KEY
const apiKey = process.env.API_KEY || '';

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
}

export const isAIConfigured = () => !!apiKey;

/**
 * Helper to clean JSON string if it comes wrapped in markdown or has extra text
 */
const cleanJSON = (text: string) => {
  if (!text) return '{}';
  
  // 1. Remove markdown wrapping if present (common issue)
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '');
  
  // 2. Locate the first '{' and last '}' to strip any conversational preamble/postscript
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned.trim();
};

/**
 * Enhances a specific piece of text based on context and tone.
 */
export const enhanceText = async (text: string, context: string, tone: string = "Romantic"): Promise<string> => {
  if (!aiClient) return text;

  const prompt = `
    You are a professional romantic writer.
    
    Task: Rewrite and expand the following text to make it more ${tone}.
    Context: The text is for a ${context} section of a birthday website.
    
    Original Text: "${text}"
    
    Requirements:
    1. Keep the core meaning.
    2. Make it sound emotional and beautiful.
    3. Use 1-2 emojis if appropriate.
    4. Return ONLY the new text. No explanations.
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Text enhancement error:", error);
    return text;
  }
};

/**
 * Creates a chat session for the interactive interview
 */
export const createChatSession = async (): Promise<Chat> => {
    if (!aiClient) throw new Error("AI not configured");

    const systemInstruction = `
      You are an enthusiastic, romantic, and helpful Birthday Page Planner. 
      Your goal is to interview the user to gather details for a surprise birthday website.

      **YOUR PERSONALITY:**
      - Charming and friendly.
      - **CRITICAL: Keep your responses SHORT and CONCISE.** (Max 1-2 sentences).
      - Don't write long paragraphs. Just acknowledge and ask the next question.

      **THE INTERVIEW FLOW (Ask these one by one):**
      1. Who is the birthday person? (Name)
      2. Who is this from? (User's Name)
      3. What is the relationship? (Partner, BFF, Sibling?)
      4. Tell me 4-6 special memories. (Encourage specific moments).
      5. What are your wishes/dreams for them? (Career, happiness, etc.)
      6. Any special items/gifts or a "Special Song"?
      7. What's the vibe/style? (Romantic, Funny, Elegant, Cool?)
      8. The Final Message: What's the main thing you want to say?
      9. **The Final Check:** "Is there anything else you want to add? Maybe an inside joke or a specific date?"

      **RULES FOR "ANYTHING ELSE":**
      - If the user says "YES" or "I have more", reply: "I'm listening! Tell me what you'd like to add." and **KEEP LISTENING**.
      - Do NOT wrap up until the user explicitly says "No", "That's it", "Nothing else", or "Done".

      **ENDING THE CHAT:**
      - Only when the user confirms they are finished, output this exact tag: [DONE]
      - Do not output [DONE] if they still have things to say.
    `;

    const chat = aiClient.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        }
    });

    return chat;
};

/**
 * Converts the full conversation history into structured BirthdayData
 */
export const convertConversationToData = async (history: { sender: string; text: string }[]): Promise<BirthdayData> => {
  if (!aiClient) throw new Error("AI not configured");

  // Format the history string for the AI to parse
  const conversationText = history
    .map(msg => `${msg.sender === 'user' ? 'User' : 'Planner'}: ${msg.text}`)
    .join('\n')
    .replace('[DONE]', '');

  const prompt = `
    You are an expert web content generator.
    I have a transcript of an interview between a Planner (AI) and a User.
    
    TRANSCRIPT:
    ${conversationText}
    
    TASK:
    Extract all the details and convert them into a structured JSON object for the birthday website.
    
    CRITICAL INSTRUCTIONS:
    1. **Tone:** Polish the user's input to be Deeply Romantic, Flirty, and "Hooky".
    2. **Design/Theme:** Pick the best 'visualStyle' based on the "Vibe" or context found in the chat.
       - 'Romantic' or 'Love' -> 'loveletter' or 'sunset'
       - 'Cool' or 'Party' -> 'neon' or 'glitch'
       - 'Classy' or 'Elegant' -> 'elegant' or 'minimal'
       - 'Nature' -> 'forest' or 'clouds'
       - 'Cosmic' or 'Stars' -> 'cosmic' or 'midnight'
       - 'Cute' or 'Soft' -> 'sakura' or 'polaroid'
       - If unsure, default to 'neon'.
       - Set 'primaryColor' to a hex code that matches this theme.
    3. **Memories:** Expand short memories into cinematic paragraphs (40-60 words). Create a short "importance" highlight for each (e.g. "Core Memory 🔓").
    4. **Wishes:** Create punchy 2-4 word titles (e.g. "CEO Energy 👑").
    5. **Final Message:** Make it a heartfelt letter.
    
    Return a JSON object matching this schema:
    {
      "basics": { "recipientName": "string", "senderName": "string", "relationship": "string", "nickname": "string" },
      "memories": [ { "description": "Long paragraph", "date": "string", "location": "string", "importance": "Short highlight phrase" } ],
      "wishes": [ { "content": "Hooky Title", "details": "Long paragraph" } ],
      "specialItems": { "gifts": "string", "insideJokes": "string", "treasuredItems": "string" },
      "personality": { "dreams": "string", "uniqueness": "string" },
      "journey": { "meetingStory": "string" },
      "message": { "main": "Long letter", "quote": "string" },
      "design": { "emojiPreference": ["string"], "primaryColor": "string", "visualStyle": "string" }
    }
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const jsonStr = cleanJSON(response.text || '{}');
    let parsed: any;
    
    try {
        parsed = JSON.parse(jsonStr);
    } catch (e) {
        console.error("JSON Parse Error", e);
        throw new Error("Failed to generate site data.");
    }

    // Merge with initial data
    const merged: BirthdayData = {
      ...INITIAL_DATA,
      ...parsed,
      basics: { ...INITIAL_DATA.basics, ...parsed.basics },
      specialItems: { ...INITIAL_DATA.specialItems, ...parsed.specialItems },
      personality: { ...INITIAL_DATA.personality, ...parsed.personality },
      journey: { ...INITIAL_DATA.journey, ...parsed.journey },
      message: { ...INITIAL_DATA.message, ...parsed.message },
      design: { ...INITIAL_DATA.design, ...parsed.design },
      memories: (parsed.memories || []).map((m: any) => ({ ...m, id: crypto.randomUUID() })),
      wishes: (parsed.wishes || []).map((w: any) => ({ ...w, id: crypto.randomUUID() }))
    };

    return merged;
  } catch (error) {
    console.error("Chat conversion error:", error);
    throw error;
  }
};

/**
 * Polishes manual user input (kept for backward compatibility if manual mode is used)
 */
export const polishManualData = async (data: BirthdayData): Promise<BirthdayData> => {
  if (!aiClient) return data;

  const prompt = `
    You are a professional romantic editor.
    Refine this data to be Flirty, Romantic, and Emoji-Rich.
    For Memories: Add "importance" highlights (e.g. "Best Day Ever 💕").
    For Wishes: Add short titles (e.g. "Future CEO 👑").
    Input JSON: ${JSON.stringify(data)}
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    const jsonStr = cleanJSON(response.text || '{}');
    const polished = JSON.parse(jsonStr);
    return { ...data, ...polished };
  } catch (error) {
    return data;
  }
};
