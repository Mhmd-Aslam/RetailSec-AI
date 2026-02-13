import Groq from "groq-sdk";
import { Alert } from "./types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "dummy_key", 
  dangerouslyAllowBrowser: true // Ideally backend only, but for this demo on client side
});

export interface AIAnalysisResult {
  explanation: string;
  mitigationSteps: string[];
  confidence: number;
}

// Mask sensitive data
function maskData(alert: Alert): string {
    const maskedIp = alert.sourceIp.replace(/\d+$/, "xxx"); // Mask last octet
    // Mask username if it existed in raw logs, but Alert type doesn't have it explicitly.
    // The description might have it.
    let description = alert.description;
    // Simple username masking pattern (e.g., user_123 -> user_***)
    description = description.replace(/(user_\d+)/g, "user_***");
    
    return JSON.stringify({
        ...alert,
        sourceIp: maskedIp,
        description: description,
        evidence: alert.evidence?.map(e => e.replace(/(user_\d+)/g, "user_***"))
    }, null, 2);
}

export async function generateThreatExplanation(alert: Alert): Promise<AIAnalysisResult> {
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY && !process.env.GROQ_API_KEY) {
         console.warn("GROQ_API_KEY not found, using fallback.");
         return getFallbackExplanation(alert);
    }

    // Check for Demo Mode
    if (typeof window !== "undefined") {
        const isDemo = localStorage.getItem("retailsec_demo_mode") === "true";
        if (isDemo) {
            return getDemoExplanation(alert);
        }
    }

    try {
        const maskedAlert = maskData(alert);
        const prompt = `
        You are a seasoned SOC Analyst. Analyze the following security alert metadata and provide a detailed explanation.
        
        Alert Data:
        ${maskedAlert}
        
        Your response MUST be in strictly valid JSON format with the following structure:
        {
            "explanation": "2-4 paragraphs explaining the threat in a professional SOC analyst tone.",
            "mitigationSteps": ["Step 1", "Step 2", "Step 3"],
            "confidence": 85 (0-100 score based on evidence strength)
        }
        
        Do not include any preamble or postscript. Only the JSON object.
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama3-70b-8192",
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const content = chatCompletion.choices[0]?.message?.content;
        if (!content) throw new Error("No content from Groq");

        const result = JSON.parse(content);
        return {
            explanation: result.explanation || "Analysis pending detailed review.",
            mitigationSteps: result.mitigationSteps || ["Isolate affected systems.", "Review logs."],
            confidence: result.confidence || 50
        };

    } catch (error) {
        console.error("Groq API Error:", error);
        // Fallback to smaller model if rate limited or error (conceptually, but sdk handles retries)
        // Check if error is related to model availability, try fallback model?
        // For simplicity, return local fallback.
        return getFallbackExplanation(alert);
    }
}

function getFallbackExplanation(alert: Alert): AIAnalysisResult {
    return {
        explanation: `This alert was triggered by the ${alert.threatType} detection rule. 
        The system detected suspicious activity from ${alert.sourceIp} involving ${alert.description}. 
        
        Manual investigation is recommended to verify the legitimacy of this activity. 
        The threat score of ${alert.threatScore} indicates a ${alert.severity} severity level.`,
        mitigationSteps: [
            "Verify the source IP address reputation.",
            "Check for associated user account compromises.",
            "Review logs for surrounding activity 5 minutes before and after."
        ],
        confidence: alert.threatScore ? Math.min(alert.threatScore, 90) : 60
    };
}

function getDemoExplanation(alert: Alert): AIAnalysisResult {
    // Return a rich, pre-canned response for demos
    return {
        explanation: `[DEMO MODE] Based on the ${alert.threatType} signature, this activity corresponds to a known attack pattern. 
        The source IP ${alert.sourceIp} has attempted similar actions across multiple delivery vectors in the last hour.
        
        This appears to be an automated script targeting the login endpoint. The high frequency of requests matches botnet signatures tracked in our threat intelligence feed.`,
        mitigationSteps: [
            "Block IP range 45.133.0.0/16 on WAF.",
            "Reset credentials for targeted accounts.",
            "Enable CAPTCHA on login forms."
        ],
        confidence: 98
    };
}
