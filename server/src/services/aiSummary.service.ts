import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

interface AISummaryResponse {
    headline: string;
    summary: string;
    highlights: string[];
    warnings: string[];
    recommendations: string[];
}

export async function generateBusinessSummary(reportData: any): Promise<AISummaryResponse | null> {
    // We expect GEMINI_API_KEY as the env variable fallback or can also use OPENAI_API_KEY if they reuse the variable name
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.warn("GEMINI_API_KEY is not defined. Skipping AI summary generation.");
        return null;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Choose gemini-2.5-flash as the free standard model
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        headline: { type: SchemaType.STRING },
                        summary: { type: SchemaType.STRING },
                        highlights: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        warnings: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        recommendations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                    },
                    required: ["headline", "summary", "highlights", "warnings", "recommendations"]
                }
            }
        });

        const minimalData = {
            period: reportData.period,
            sales: reportData.sections?.sales?.metrics,
            inventory: reportData.sections?.inventory?.metrics,
            customers: reportData.sections?.customers?.metrics,
            suppliers: reportData.sections?.suppliers?.metrics,
            purchases: reportData.sections?.purchases?.metrics,
            cashFlow: reportData.sections?.cashFlow?.metrics,
            profitability: reportData.sections?.profitability?.metrics,
        };

        const prompt = `You are an experienced business analyst helping small Indian retailers understand today's business performance.

Your job is to summarize only the supplied report data.
Never invent numbers.
Never make assumptions beyond the provided metrics.
Keep responses concise.
Focus on actionable recommendations.

If there are no warnings or recommendations, return empty arrays.

Data:
${JSON.stringify(minimalData, null, 2)}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text) return null;

        const parsed = JSON.parse(text) as AISummaryResponse;
        return parsed;
    } catch (error) {
        console.error("AI Summary generation failed:", error);
        return null;
    }
}
