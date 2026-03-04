import { LogEntry } from "./threatEngine";

/**
 * Generates a set of malicious logs to simulate common attack vectors.
 * 
 * Simulated vectors:
 * 1. Credential Stuffing: 15 rapid LOGIN_ATTEMPT failures from a single IP.
 * 2. Payment Fraud: 4 small failures followed by a high-value SUCCESS ($15,000) transaction.
 * 
 * @param baseTimestamp The starting ISO timestamp for log generation.
 * @returns Array of malicious LogEntry objects.
 */
export function generateMaliciousLogs(baseTimestamp: string = new Date().toISOString()): LogEntry[] {
    const logs: LogEntry[] = [];
    const attackerIP1 = "45.133.1.55"; 
    const attackerIP2 = "192.168.99.100";

    const baseTime = new Date(baseTimestamp).getTime();

    // Vector 1: Credential Stuffing (High-frequency brute force)
    for (let i = 0; i < 15; i++) {
        logs.push({
            timestamp: new Date(baseTime + i * 1000).toISOString(),
            ip: attackerIP1,
            username: `admin_test_${i}`,
            action: "LOGIN_ATTEMPT",
            status: "FAIL",
            userAgent: "Mozilla/5.0 (Hydra/1.0)",
            deviceType: "desktop",
            location: "Unknown Proxy"
        });
    }

    // Vector 2: Payment Fraud (Probabilistic velocity check bypass)
    // 4 failed attempts to test transaction limits
    for (let i = 0; i < 4; i++) {
        logs.push({
            timestamp: new Date(baseTime + 20000 + i * 2000).toISOString(),
            ip: attackerIP2,
            username: "jdoe_hacked",
            action: "PAYMENT_ATTEMPT",
            status: "FAIL",
            amount: (50 + i * 10).toString(),
            userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)",
            deviceType: "mobile",
            location: "Lagos, NG"
        });
    }

    // High-value fraudulent success
    logs.push({
        timestamp: new Date(baseTime + 30000).toISOString(),
        ip: attackerIP2,
        username: "jdoe_hacked",
        action: "PAYMENT_ATTEMPT",
        status: "SUCCESS",
        amount: "15000.00",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)",
        deviceType: "mobile",
        location: "Lagos, NG"
    });

    return logs;
}
