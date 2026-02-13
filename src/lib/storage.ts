import { Alert } from "./types";
export type { Alert };

const STORAGE_KEY = "retailsec_alerts";

export function getAlerts(): Alert[] {
  if (typeof window === "undefined") return [];
  const start = localStorage.getItem(STORAGE_KEY);
  return start ? JSON.parse(start) : [];
}

export function saveAlert(alert: Alert) {
  const alerts = getAlerts();
  const newAlerts = [alert, ...alerts];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newAlerts));
}

export function clearAlerts() {
  localStorage.removeItem(STORAGE_KEY);
}

// Mock generator
export function generateMockAlert(): Alert {
  const severities = ["low", "medium", "high", "critical"] as const;
  const statuses = ["new", "investigating", "resolved"] as const;
  
  return {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    severity: severities[Math.floor(Math.random() * severities.length)],
    sourceIcon: "server",
    description: "Suspicious activity detected in server logs",
    sourceIp: `192.168.1.${Math.floor(Math.random() * 255)}`,
    destinationIp: `10.0.0.${Math.floor(Math.random() * 255)}`,
    status: "new",
  };
}
