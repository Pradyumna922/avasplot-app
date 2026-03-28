// ============================================================================
// 🤖 GROQ AI SERVICE — Using fetch() for React Native compatibility
// ============================================================================
// NOTE: We use direct fetch() instead of groq-sdk because groq-sdk relies on
// Node.js APIs (fs, net, http) that crash in EAS/native builds.

import { ENV } from '../config/env';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface GroqChatOptions {
    response_format?: { type: string };
}

/**
 * Makes a direct REST API call to Groq's chat completions endpoint.
 * Drop-in replacement for groq.chat.completions.create().
 */
async function groqChat(messages: ChatMessage[], options?: GroqChatOptions) {
    const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${ENV.groq.apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: ENV.groq.model,
            messages,
            ...(options?.response_format ? { response_format: options.response_format } : {}),
        }),
    });

    if (!res.ok) {
        const errorData = await res.text();
        console.error('Groq API HTTP error:', res.status, errorData);
        throw new Error(`Groq API error: ${res.status}`);
    }

    return res.json();
}

const SYSTEM_PROMPT = `
You are Avas AI, an elite, professional, and knowledgeable Real Estate Assistant for AvasPlot.
Your primary role is to help users navigate the real estate market in Maharashtra, India (focusing on Pune, Mumbai, Nashik, etc).

Guidelines:
1. Always be polite, concise, and professional.
2. Structure your replies using short paragraphs and bullet points so they are legible on a mobile app screen.
3. You can answer queries concerning plot sizes (Gunta, Sq Ft, Acres), property market trends, Vastu Shastra principles, and legal documents (like 7/12 Extracts and Aadhaar verification).
4. If a user asks for properties, kindly tell them to browse the Home feed or the Search page, as you are a conversational guide.
5. Do NOT hallucinate specific property listings. Speak in general market guidelines unless the user explicitly provides property details.
`;

export const groqService = {
    /**
     * Generates a single response from the Groq model based on the user's prompt.
     */
    async generateResponse(prompt: string): Promise<string> {
        try {
            const chatCompletion = await groqChat([
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt }
            ]);

            return chatCompletion.choices[0]?.message?.content || '';
        } catch (error) {
            console.error('Groq API Error:', error);
            throw new Error('Failed to generate AI response.');
        }
    },

    /**
     * Replicates the multi-turn chat start.
     * Note: For Groq, we handle history by passing the array of messages.
     */
    startChatSession() {
        return {
            sendMessage: async (text: string) => {
                const response = await groqService.generateResponse(text);
                return {
                    response: {
                        text: () => response
                    }
                };
            }
        };
    },

    /**
     * Generates a 2-sentence professional investment summary for a single property.
     */
    async generatePropertySummary(propertyData: any): Promise<string> {
        try {
            const prompt = `Analyze this property and write a 2-sentence professional real estate summary:
Title: ${propertyData.title}
Location: ${propertyData.location}, ${propertyData.city || ''}
Price: ${propertyData.price}
Type: ${propertyData.type}`;

            const chatCompletion = await groqChat([
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt }
            ]);

            return chatCompletion.choices[0]?.message?.content || 'AI Summary currently unavailable.';
        } catch (error) {
            console.error('Groq Summary Error:', error);
            return 'AI Summary currently unavailable.';
        }
    },

    /**
     * Computes a pseudo-calculated Vastu score and 3-Year Future Price Forecast.
     */
    async generateVastuAndGrowth(propertyData: any): Promise<{ vastuScore: number; forecast?: { year: number, growthPct: number, priceStr: string }[] }> {
        try {
            const currentYear = new Date().getFullYear();
            const y1 = currentYear + 1;
            const y2 = currentYear + 2;
            const y3 = currentYear + 3;

            const prompt = `Based strictly on the following property details in Maharashtra, India:
Title: ${propertyData.title}
Location: ${propertyData.location}, ${propertyData.city || ''}
Type: ${propertyData.type}
Current Price: ${propertyData.price}

Provide a calculated estimate for:
1. Vastu Score (out of 100). If no direction is provided, assume a generic favorable score between 70-85.
2. A 3-Year Market Forecast array extending for the years ${y1}, ${y2}, and ${y3}. Outline the projected growth percentage for each year sequentially, and estimate the new raw price string (e.g. "26.25 Cr" or "84.5 Lacs").

Return ONLY a valid JSON object matching EXACTLY this structure schema:
{
  "vastuScore": 85,
  "forecast": [
    { "year": ${y1}, "growthPct": 5, "priceStr": "26.25 Cr" },
    { "year": ${y2}, "growthPct": 6, "priceStr": "27.82 Cr" },
    { "year": ${y3}, "growthPct": 7, "priceStr": "29.77 Cr" }
  ]
}
Do NOT return markdown or explanation.`;

            const chatCompletion = await groqChat(
                [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: prompt }
                ],
                { response_format: { type: "json_object" } }
            );

            const responseText = chatCompletion.choices[0]?.message?.content || '{}';
            return JSON.parse(responseText);
        } catch (error) {
            console.error('Groq Forecast Error:', error);
            const currentYear = new Date().getFullYear();
            return {
                vastuScore: 80,
                forecast: [
                    { year: currentYear + 1, growthPct: 8, priceStr: "TBD" },
                    { year: currentYear + 2, growthPct: 10, priceStr: "TBD" },
                    { year: currentYear + 3, growthPct: 12, priceStr: "TBD" }
                ]
            };
        }
    },

    /**
     * Analyzes two properties side-by-side and returns a comprehensive recommendation text block.
     */
    async compareProperties(propA: any, propB: any): Promise<string> {
        try {
            const prompt = `Act as an expert Real Estate Analyst. Compare these two properties side-by-side and provide a bulleted summary of their core differences and investment potential, followed by a final recommendation.

Property A:
Title: ${propA.title}
Location: ${propA.location}, ${propA.city || ''}
Price: ${propA.price}
Area: ${propA.area || 'Unknown'} sqft
Type: ${propA.type}

Property B:
Title: ${propB.title}
Location: ${propB.location}, ${propB.city || ''}
Price: ${propB.price}
Area: ${propB.area || 'Unknown'} sqft
Type: ${propB.type}

Format your response EXACTLY like this:
• [Bullet point 1 about key difference/advantage]
• [Bullet point 2 about investment potential/usage]
• [Bullet point 3 about long-term value]

Recommendation: Opt for [Property Name] for [Reason], or [Other Property] for [Other Reason].`;

            const chatCompletion = await groqChat([
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt }
            ]);

            return chatCompletion.choices[0]?.message?.content?.trim() || 'Comparative Analysis currently unavailable.';
        } catch (error) {
            console.error('Groq Compare Error:', error);
            return 'Comparative Analysis currently unavailable.';
        }
    }
};
