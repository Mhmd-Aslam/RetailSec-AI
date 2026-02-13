import { Alert } from "@/lib/storage";

export function generateIncidentReport(alerts: Alert[]): string {
    const criticalCount = alerts.filter(a => a.severity === "critical").length;
    const highCount = alerts.filter(a => a.severity === "high").length;
    const mediumCount = alerts.filter(a => a.severity === "medium").length;
    const lowCount = alerts.filter(a => a.severity === "low").length;

    const uniqueIPs = new Set(alerts.map(a => a.sourceIp)).size;
    const uniqueTypes = new Set(alerts.map(a => a.threatType)).size;

    const topIPs = Object.entries(alerts.reduce((acc, curr) => {
        acc[curr.sourceIp] = (acc[curr.sourceIp] || 0) + 1;
        return acc;
    }, {} as Record<string, number>))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const criticalAlerts = alerts.filter(a => a.severity === "critical" || a.severity === "high");

    return `
SECURITY INCIDENT REPORT
Generated on: ${new Date().toLocaleString()}
--------------------------------------------------------------------------------
EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
A total of ${alerts.length} security alerts were detected during the analysis period.
Key metrics:
- Critical Threats: ${criticalCount}
- High Severity:    ${highCount}
- Medium Severity:  ${mediumCount}
- Low Severity:     ${lowCount}

Unique Source IPs involved: ${uniqueIPs}
Unique Threat Types detected: ${uniqueTypes}

Status: ${criticalCount > 0 ? "CRITICAL - IMMEDIATE ACTION REQUIRED" : "WARNING - INVESTIGATION RECOMMENDED"}

--------------------------------------------------------------------------------
TOP SUSPICIOUS IPs
--------------------------------------------------------------------------------
${topIPs.map(([ip, count]) => `- ${ip} (${count} attempts)`).join("\n")}

--------------------------------------------------------------------------------
DETECTED THREATS DETAIL (High/Critical Only)
--------------------------------------------------------------------------------
${criticalAlerts.length === 0 ? "No critical or high severity threats detected." : criticalAlerts.map(alert => `
[${alert.timestamp}] ${(alert.threatType || "UNKNOWN").toUpperCase()} (Severity: ${alert.severity})
Source: ${alert.sourceIp} | Score: ${alert.threatScore}
Description: ${alert.description}
AI Analysis:
${alert.aiExplanation ? alert.aiExplanation.replace(/\n/g, "\n  ") : "  Pending/Not Available"}

Recommended Action:
${alert.recommendedAction}
`).join("\n--------------------------------------------------------------------------------\n")}

--------------------------------------------------------------------------------
RECOMMENDED ACTIONS
--------------------------------------------------------------------------------
1. Block the Top Suspicious IPs listed above at the firewall level immediately.
2. Reset credentials for any accounts involved in "Credential Stuffing" or "Brute Force" attacks.
3. Review successful login logs for the IPs listed to identify potential breaches.
4. Patch systems to address any specific vulnerability exploits detected (e.g., SQLi, XSS).

--------------------------------------------------------------------------------
FUTURE IMPROVEMENTS
--------------------------------------------------------------------------------
- Implement stricter Rate Limiting on login endpoints.
- Enable Geo-blocking for regions with high attack volume if no business presence exists.
- Deploy a Web Application Firewall (WAF) to filter malicious traffic patterns automatically.

--------------------------------------------------------------------------------
END OF REPORT
CONFIDENTIAL - INTERNAL USE ONLY
    `.trim();
}

export function downloadReport(alerts: Alert[]) {
    const reportText = generateIncidentReport(alerts);
    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Incident_Report_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
