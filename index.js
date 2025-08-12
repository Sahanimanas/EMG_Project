const admin = require('firebase-admin');

// ✅ Load service account depending on environment
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // From environment variable (deployment)
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // From local file (development)
  serviceAccount = require('./serviceKeyAccount.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

function generateData() {
  const ranges = {
    palm: [215, 225],
    forearm: [0.5, 5.5],
    bicep: [20, 50],
    leg: [10, 100]
  };

  const keys = Object.keys(ranges);
  const chosenKey = keys[Math.floor(Math.random() * keys.length)];
  const [min, max] = ranges[chosenKey];
  const value = parseFloat((min + Math.random() * (max - min)).toFixed(2));

  const now = new Date();
  const offsetMs = 5.5 * 60 * 60 * 1000;
  const localTime = new Date(now.getTime() + offsetMs);
  const isoStringWithOffset = localTime.toISOString().replace('Z', '+05:30');

  return { type: chosenKey, value, timestamp: isoStringWithOffset };
}

async function sendToFirebase() {
  try {
    const data = generateData();
    await db.collection('EMGData').add(data);
    console.log(`📤 Sent: ${data.type}, ${data.value}, ${data.timestamp}`);
  } catch (error) {
    console.error("❌ Error sending to Firebase:", error);
  }
}

setInterval(sendToFirebase, 10000);
console.log("🚀 Mock ESP Server started — sending data to Firebase every 10s...");
