const fs = require('fs');

const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    "Go-http-client/1.1",
    "python-requests/2.25.1",
    "Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
];

const locations = [
    "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ",
    "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA"
];

const actions = ["LOGIN_ATTEMPT", "PAYMENT_ATTEMPT", "API_REQUEST", "POS_ACTIVITY"];
const statuses = ["SUCCESS", "FAIL"];
const deviceTypes = ["desktop", "mobile", "pos-terminal"];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

const logs = [];

// 1. Credential Stuffing Attack (Targeted IP, many failed logins)
const targetedIP = "192.168.1.105";
for (let i = 0; i < 50; i++) {
    logs.push({
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        ip: targetedIP,
        username: `user_${Math.floor(Math.random() * 1000)}`,
        action: "LOGIN_ATTEMPT",
        status: "FAIL",
        userAgent: "python-requests/2.25.1",
        deviceType: "desktop",
        location: "Unknown, XX"
    });
}

// 2. Bot Traffic (High API requests from single IP)
const botIP = "45.33.22.11";
for (let i = 0; i < 60; i++) {
    logs.push({
        timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString(),
        ip: botIP,
        username: "system_api",
        action: "API_REQUEST",
        status: Math.random() > 0.1 ? "SUCCESS" : "FAIL",
        userAgent: "Go-http-client/1.1",
        deviceType: "desktop",
        location: "Moscow, RU"
    });
}

// 3. Payment Fraud (Many small failed payments then success)
const fraudUser = "john_doe_compromised";
const fraudIP = "203.0.113.45";
for (let i = 0; i < 15; i++) {
    logs.push({
        timestamp: new Date(Date.now() - Math.random() * 1800000).toISOString(),
        ip: fraudIP,
        username: fraudUser,
        action: "PAYMENT_ATTEMPT",
        status: "FAIL",
        amount: (Math.random() * 100).toFixed(2),
        userAgent: userAgents[0],
        deviceType: "mobile",
        location: "Lagos, NG"
    });
}
// One successful large payment
logs.push({
    timestamp: new Date().toISOString(),
    ip: fraudIP,
    username: fraudUser,
    action: "PAYMENT_ATTEMPT",
    status: "SUCCESS",
    amount: "5000.00",
    userAgent: userAgents[0],
    deviceType: "mobile",
    location: "Lagos, NG"
});

// 4. Suspicious POS Activity
const posID = "POS-TERM-007";
for (let i = 0; i < 20; i++) {
    logs.push({
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        ip: "10.0.0.55",
        username: "store_mngr",
        action: "POS_ACTIVITY",
        status: "FAIL", // Unusual failures
        amount: "0.00",
        userAgent: "Embed/1.0",
        deviceType: "pos-terminal",
        location: "New York, NY"
    });
}

// 5. Normal Traffic (Fill the rest)
const normalCount = 300 - logs.length;
for (let i = 0; i < normalCount; i++) {
    const action = getRandomItem(actions);
    logs.push({
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
        ip: generateRandomIP(),
        username: `user_${Math.floor(Math.random() * 500)}`,
        action: action,
        status: Math.random() > 0.05 ? "SUCCESS" : "FAIL",
        amount: action === "PAYMENT_ATTEMPT" ? (Math.random() * 500).toFixed(2) : undefined,
        userAgent: getRandomItem(userAgents),
        deviceType: getRandomItem(deviceTypes),
        location: getRandomItem(locations)
    });
}

// Shuffle logs by timestamp
logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

fs.writeFileSync('data/sample_logs.json', JSON.stringify(logs, null, 2));
console.log(`Generated ${logs.length} logs.`);
