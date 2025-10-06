// api/search.ts
import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// This is the data type we expect from the frontend
interface BagParameters {
  bagType: string;
  size: string;
  thickness: number;
  printColors: number;
  material: string;
}

// Function to generate the prompt, same as before, but now on the server
const generatePrompt = (params: BagParameters): string => {
    const { bagType, size, thickness, printColors, material } = params;
    return `
        You are an advanced sourcing assistant for the packaging industry in Brazil. Your mission is to conduct a deep web search to identify the best suppliers of custom plastic bags. Your task is to find relevant suppliers, strongly prioritizing those who publish prices, but also including good contacts that require a consultation. 'Plastcustom Embalagens' must be EXCLUDED from all results.

        **Search Criteria:**
        - Bag Type: "${bagType}"
        - Approximate Size: "${size} cm"
        - Thickness: "${thickness} microns"
        - Printing: "${printColors} colors"
        - Material: "${material}"

        **Your Search and Analysis Process (Follow these steps):**
        1.  **Formulate Multiple Search Queries:** Create and execute several variations of Google searches to maximize discovery. Focus on terms like "price of ${bagType} bag", "supplier of ${bagType} ${material} bag", "buy custom plastic bags".
        2.  **Analyze Search Results:** Visit the websites found.
            - **Top Priority:** Find suppliers that display prices online.
            - **Secondary Inclusion:** If a site belongs to a relevant supplier but does not display prices, include it in the results.
        3.  **Extract Information:** For each supplier found, extract the following:
            - **factoryName**: Company name.
            - **location**: City and State.
            - **estimatedPriceRange**: A price range for 1000 units. If the price is public, show it (e.g., "R$ 250 - R$ 350 per thousand"). **If there is no price, you MUST use "Sob consulta".**
            - **minPrice**: The minimum numeric value of the price range. If none, use **null**.
            - **maxPrice**: The maximum numeric value of the price range. If none, use **null**.
            - **estimatedLeadTime**: The estimated delivery time (e.g., "15-20 business days"). If not found, use "Sob consulta".
            - **avgLeadTimeDays**: The average lead time in days (number, or null if not found).
            - **reviewsSummary**: A brief summary of the company's reputation or specialty, based on information from the site or reviews.
            - **rating**: A numerical rating from 1 to 5, based on online reputation. If not found, return null.
            - **keyAdvantage**: A clear competitive advantage (e.g., "Transparent online prices", "Wide variety of materials").
            - **contact**: An object with 'phone', 'email', 'whatsapp', and 'website'.
            - **foundMaterial**: The bag material for which the price was found. If no price, describe the main material offered. If unclear, return null.
            - **foundSize**: The bag size for which the price was found. If unclear, return null.
            - **foundThickness**: The bag thickness in microns for which the price was found. If unclear, return null.
            - **foundPrintColors**: The number of print colors for which the price was found. If unclear, return null.
        4.  **Validation and Quality:** Prioritize results with professional websites and clear contact information. Ignore generic directories.

        **MANDATORY Output Format:**
        Your final response must be ONLY a sequence of JSON objects, one per line (JSONL format).
        
        Start the search now.
    `;
};

// This is the main handler for the Serverless Function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // SECURELY initialize Gemini AI using the API key from environment variables
    // This key is configured in the Vercel dashboard, NOT in the code.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const params: BagParameters = req.body;
    const prompt = generatePrompt(params);

    const responseStream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
            temperature: 0.5,
            thinkingConfig: { thinkingBudget: 0 },
        },
    });

    // Set headers for streaming
    res.setHeader('Content-Type', 'application/jsonl; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let groundingMetadata: any = null;
    let buffer = "";

    // Stream the response back to the client
    for await (const chunk of responseStream) {
        if (chunk.candidates?.[0]?.groundingMetadata) {
           groundingMetadata = chunk.candidates[0].groundingMetadata;
        }
        
        buffer += chunk.text;
        const lines = buffer.split('\n');
        buffer = lines.pop() || ""; // keep the last partial line in the buffer

        for (const line of lines) {
            if (line.trim()) {
                try {
                    // We validate if it's JSON and send one complete object per line
                    const result = JSON.parse(line.trim());
                    if(result.factoryName) {
                        res.write(JSON.stringify(result) + '\n');
                    }
                } catch (e) {
                    // Ignore parsing errors for partial lines
                }
            }
        }
    }
     // Process anything left in the buffer
    if (buffer.trim()) {
        try {
            const result = JSON.parse(buffer.trim());
            if(result.factoryName) {
                res.write(JSON.stringify(result) + '\n');
            }
        } catch(e) {/* ignore */}
    }

    // Send grounding metadata at the end, with a special marker
    if (groundingMetadata) {
        res.write('__METADATA__:' + JSON.stringify(groundingMetadata) + '\n');
    }

    // End the response stream
    res.end();

  } catch (error) {
    console.error("Error in Serverless Function:", error);
    res.status(500).json({ error: 'Failed to process request with AI.' });
  }
}
