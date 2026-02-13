import { LogEntry } from "./threatEngine";

export function generateMaliciousLogs(baseTimestamp: string = new Date().toISOString()): LogEntry[] {
    const logs: LogEntry[] = [];
    const attackerIP1 = "45.133.1.55"; // Known bad IP for simulation
    const attackerIP2 = "192.168.99.100";

    const baseTime = new Date(baseTimestamp).getTime();

    // 1. Credential Stuffing Attack (15 logs)
    // Rapid failed logins from same IP
    for (let i = 0; i < 15; i++) {
        logs.push({
            timestamp: new Date(baseTime + i * 1000).toISOString(), // 1 second apart
            ip: attackerIP1,
            username: `admin_test_${i}`,
            action: "LOGIN_ATTEMPT",
            status: "FAIL",
            userAgent: "Mozilla/5.0 (Hydra/1.0)",
            deviceType: "desktop",
            location: "Unknown Proxy"
        });
    }

    // 2. Payment Fraud (5 logs)
    // 4 Failures then 1 Big Success
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

    // The successful fraud
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
