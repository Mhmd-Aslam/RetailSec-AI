import { Alert } from "./types";

/**
 * Structure of the AI-generated threat analysis.
 */
export interface AIAnalysisResult {
  explanation: string;
  mitigationSteps: string[];
  confidence: number;
  status: "live" | "demo" | "fallback_no_key" | "fallback_error";
}

/**
 * Sanitizes alert data before transmission to the LLM to preserve privacy.
 * 
 * Performs:
 * - IPv4 octet masking (removes last octet).
 * - Regex-based username obfuscation in descriptions and evidence.
 * 
 * @param alert The raw alert object.
 * @returns Serialized JSON string of the masked alert.
 */
function maskData(alert: Alert): string {
    const maskedIp = alert.sourceIp.replace(/\d+$/, "xxx"); 
    
    let description = alert.description;
    description = description.replace(/(user_\d+)/g, "user_***");
    
    return JSON.stringify({
        ...alert,
        sourceIp: maskedIp,
        description: description,
        evidence: alert.evidence?.map(e => e.replace(/(user_\d+)/g, "user_***"))
    }, null, 2);
}

/**
 * Generates an AI-powered explanation and mitigation plan.
 * 
 * Implements a multi-tier fallback strategy:
 * 1. Demo Mode Check -> Use high-fidelity canned response if active.
 * 2. Live API Call -> Delegate to internal server-side API route (secure).
 * 3. Error Catch -> Graceful fallback to rule-based summary.
 * 
 * @param alert The security alert to analyze.
 * @returns Promise resolving to the AI analysis result.
 */
export async function generateThreatExplanation(alert: Alert): Promise<AIAnalysisResult> {
    // Check for Demo Mode (Client-side logic)
    if (typeof window !== "undefined") {
        const isDemo = localStorage.getItem("retailsec_demo_mode") === "true";
        if (isDemo) {
            return getDemoExplanation(alert);
        }
    }

    try {
        const maskedAlert = maskData(alert);
        
        // Call internal API route instead of direct Groq SDK
        const response = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ alertData: maskedAlert })
        });

        if (!response.ok) {
            const errorData = await response.json();
            
            // Handle specific error statuses from our backend
            if (response.status === 401) {
                return {
                    ...getFallbackExplanation(alert),
                    status: "fallback_no_key"
                };
            }
            
            if (response.status === 429) {
                return {
                    ...getFallbackExplanation(alert),
                    status: "fallback_error" // UI handles this as "Rate limit reached"
                };
            }

            // General fallback for missing key or other 500 errors
            if (response.status === 500 && errorData.error?.includes("Key not configured")) {
                return {
                    ...getFallbackExplanation(alert),
                    status: "fallback_no_key"
                };
            }
            throw new Error(errorData.error || "API failure");
        }

        const result = await response.json();
        
        return {
            explanation: result.explanation || "Analysis pending detailed review.",
            mitigationSteps: result.mitigationSteps || ["Isolate affected systems.", "Review logs."],
            confidence: result.confidence || 50,
            status: "live"
        };

    } catch (error) {
        console.error("AI Analysis Error:", error);
        return {
            ...getFallbackExplanation(alert),
            status: "fallback_error"
        };
    }
}

/**
 * Rule-based fallback for scenarios where the AI engine is unavailable.
 */
function getFallbackExplanation(alert: Alert): Omit<AIAnalysisResult, "status"> {
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

/**
 * Static high-fidelity responses for presentation stability.
 */
function getDemoExplanation(alert: Alert): AIAnalysisResult {
    return {
        explanation: `[DEMO MODE] Based on the ${alert.threatType} signature, this activity corresponds to a known attack pattern. 
        The source IP ${alert.sourceIp} has attempted similar actions across multiple delivery vectors in the last hour.
        
        This appears to be an automated script targeting the login endpoint. The high frequency of requests matches botnet signatures tracked in our threat intelligence feed.`,
        mitigationSteps: [
            "Block IP range 45.133.0.0/16 on WAF.",
            "Reset credentials for targeted accounts.",
            "Enable CAPTCHA on login forms."
        ],
        confidence: 98,
        status: "demo"
    };
}
