export interface Alert {
  id: string;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  sourceIcon: string; // just a string identifier for now
  description: string;
  sourceIp: string;
  destinationIp: string;
  status: "new" | "investigating" | "resolved";
  threatType?: string;
  threatScore?: number;
  evidence?: string[];
  recommendedAction?: string; // AI generated mitigation steps can go here or appending to this
  aiExplanation?: string;
  aiConfidence?: number;
  actionTaken?: boolean;
  actionTimestamp?: string;
}
