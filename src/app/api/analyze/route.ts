import { NextResponse } from "next/server";
import Groq from "groq-sdk";

/**
 * Server-side API route for secure threat analysis.
 * Prevents GROQ_API_KEY from being exposed to the client browser.
 */
export async function POST(request: Request) {
  try {
    const { alertData } = await request.json();

    const apiKey = process.env.GROQ_API_KEY?.trim();

    if (!apiKey || apiKey === "your_actual_api_key" || apiKey === "your_api_key_here") {
      console.error("GROQ_API_KEY is missing, empty, or a placeholder.");
      return NextResponse.json(
        { error: "API Key not configured on server." }, 
        { status: 500 }
      );
    }

    const groq = new Groq({
      apiKey: apiKey,
    });

    const prompt = `
    You are a seasoned SOC Analyst. Analyze the following security alert metadata and provide a detailed explanation.
    
    Alert Data:
    ${alertData}
    
    Your response MUST be in strictly valid JSON format with the following structure:
    {
        "explanation": "2-4 paragraphs explaining the threat in a professional SOC analyst tone.",
        "mitigationSteps": ["Step 1", "Step 2", "Step 3"],
        "confidence": 85
    }
    
    Do not include any preamble or postscript. Only the JSON object.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) throw new Error("No content from Groq");

    let result;
    try {
      result = JSON.parse(content);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      // Fallback if LLM output is malformed
      result = {
        explanation: content.substring(0, 500),
        mitigationSteps: ["Review system logs.", "Isolate suspicious IP."],
        confidence: 50
      };
    }

    return NextResponse.json({
      explanation: result.explanation || "Analysis pending detailed review.",
      mitigationSteps: Array.isArray(result.mitigationSteps) ? result.mitigationSteps : ["Check logs.", "Isolate host."],
      confidence: result.confidence || 50
    });

  } catch (error: any) {
    console.error("API Route Error:", error);
    
    // Detect specific Groq API errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: "Invalid API Key. Please check your .env.local configuration." }, 
        { status: 401 }
      );
    }
    
    if (error.status === 429) {
      return NextResponse.json(
        { error: "Rate limit reached. Please wait a moment before trying again." }, 
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process AI analysis" }, 
      { status: 500 }
    );
  }
}
