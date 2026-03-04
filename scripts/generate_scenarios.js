const fs = require('fs');
const path = require('path');

const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    "Go-http-client/1.1",
    "python-requests/2.25.1"
];

const locations = ["New York, NY", "Los Angeles, CA", "Chicago, IL", "London, UK", "Tokyo, JP", "Berlin, DE"];
const deviceTypes = ["desktop", "mobile", "pos-terminal"];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function saveScenario(name, logs) {
    const dir = path.join(__dirname, '..', 'public', 'samples');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(logs, null, 2));
    console.log(`Saved ${name}.json with ${logs.length} logs.`);
}

// 1. Normal Traffic Scenario
function generateNormal() {
    const logs = [];
    for (let i = 0; i < 100; i++) {
        logs.push({
            timestamp: new Date(Date.now() - i * 60000).toISOString(),
            ip: generateRandomIP(),
            username: `user_${Math.floor(Math.random() * 100)}`,
            action: getRandomItem(["LOGIN_ATTEMPT", "API_REQUEST"]),
            status: "SUCCESS",
            userAgent: getRandomItem(userAgents),
            deviceType: getRandomItem(deviceTypes),
            location: getRandomItem(locations)
        });
    }
    saveScenario('normal_traffic', logs);
}

// 2. Credential Stuffing Scenario
function generateAttack() {
    const logs = [];
    const attackerIP = "45.133.1.55";
    for (let i = 0; i < 25; i++) {
        logs.push({
            timestamp: new Date(Date.now() - i * 2000).toISOString(),
            ip: attackerIP,
            username: `admin_root_${i}`,
            action: "LOGIN_ATTEMPT",
            status: "FAIL",
            userAgent: "Mozilla/5.0 (Hydra/1.1)",
            deviceType: "desktop",
            location: "Unknown Proxy"
        });
    }
    saveScenario('brute_force_attack', logs);
}

// 3. Payment Fraud Scenario
function generateFraud() {
    const logs = [];
    const fraudIP = "192.168.99.100";
    for (let i = 0; i < 8; i++) {
        logs.push({
            timestamp: new Date(Date.now() - i * 5000).toISOString(),
            ip: fraudIP,
            username: "victim_user_123",
            action: "PAYMENT_ATTEMPT",
            status: "FAIL",
            amount: (10 + i).toString(),
            userAgent: userAgents[2],
            deviceType: "mobile",
            location: "Lagos, NG"
        });
    }
    logs.push({
        timestamp: new Date().toISOString(),
        ip: fraudIP,
        username: "victim_user_123",
        action: "PAYMENT_ATTEMPT",
        status: "SUCCESS",
        amount: "12500.00",
        userAgent: userAgents[2],
        deviceType: "mobile",
        location: "Lagos, NG"
    });
    saveScenario('payment_fraud', logs);
}

generateNormal();
generateAttack();
generateFraud();
