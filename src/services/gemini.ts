import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../config/env';

// Initialize the Google Generative AI SDK using the securely stored API Key
const genAI = new GoogleGenerativeAI(ENV.gemini.apiKey);

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

export const geminiService = {
    /**
     * Generates a single response from the Gemini model based on the user's prompt.
     * This handles single-turn queries but keeps the core Avas System Instruction.
     */
    async generateResponse(prompt: string): Promise<string> {
        try {
            // Use the gemini model set in environment (usually gemini-1.5-flash)
            const model = genAI.getGenerativeModel({
                model: ENV.gemini.model,
                systemInstruction: SYSTEM_PROMPT,
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw new Error('Failed to generate AI response.');
        }
    },

    /**
     * Initializes a multi-turn chat session.
     * Useful when we want the model to remember past user interactions.
     */
    startChatSession() {
        const model = genAI.getGenerativeModel({
            model: ENV.gemini.model,
            systemInstruction: SYSTEM_PROMPT,
        });

        return model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: 'Hello!' }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'Greetings! I am Avas AI. How can I help you find your dream property today?' }],
                },
            ],
        });
    },

    /**
     * Generates a 2-sentence professional investment summary for a single property.
     */
    async generatePropertySummary(propertyData: any): Promise<string> {
        try {
            const model = genAI.getGenerativeModel({
                model: ENV.gemini.model,
                systemInstruction: SYSTEM_PROMPT,
            });

            const prompt = `Analyze this property and write a 2-sentence professional real estate summary:
Title: ${propertyData.title}
Location: ${propertyData.location}, ${propertyData.city || ''}
Price: ${propertyData.price}
Type: ${propertyData.type}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini Summary Error:', error);
            return 'AI Summary currently unavailable.';
        }
    },

    /**
     * Computes a pseudo-calculated Vastu score and 3-Year Future Price Forecast.
     * Returns a JSON payload containing { vastuScore: number, forecast: Array<{ year, growthPct, priceStr }> }
     */
    async generateVastuAndGrowth(propertyData: any): Promise<{ vastuScore: number; forecast?: { year: number, growthPct: number, priceStr: string }[] }> {
        try {
            const model = genAI.getGenerativeModel({
                model: ENV.gemini.model,
                systemInstruction: SYSTEM_PROMPT,
            });

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

            const result = await model.generateContent(prompt);
            const responseText = (await result.response).text().replace(/```json/gi, '').replace(/```/gi, '').trim();
            return JSON.parse(responseText);
        } catch (error) {
            console.error('Gemini Forecast Error:', error);
            // Fallback defaults if generation fails
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
            const model = genAI.getGenerativeModel({
                model: ENV.gemini.model,
                systemInstruction: SYSTEM_PROMPT,
            });

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

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error('Gemini Compare Error:', error);
            return 'Comparative Analysis currently unavailable.';
        }
    }
};
