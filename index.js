
const admin = require('firebase-admin');
require('dotenv').config();
// Railway: Use environment variable for Firebase service account JSON
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://<YOUR_FIREBASE_PROJECT>.firebaseio.com"
});

const db = admin.firestore();

// Generate realistic sensor readings
function generateData() {
  // Define value ranges for each type
  const ranges = {
    palm: [215, 225],       // V
    forearm: [0.5, 5.5],    // A
    bicep: [20, 50],        // W
    leg: [10, 100]          // arbitrary unit
  };

  // Randomly pick one key
  const keys = Object.keys(ranges);
  const chosenKey = keys[Math.floor(Math.random() * keys.length)];

  // Generate random value in the chosen range
  const [min, max] = ranges[chosenKey];
  const value = parseFloat((min + Math.random() * (max - min)).toFixed(2));

  // Get current time and add +05:30 offset
  const now = new Date();
  const offsetMs = 5.5 * 60 * 60 * 1000;
  const localTime = new Date(now.getTime() + offsetMs);
  const isoStringWithOffset = localTime.toISOString().replace('Z', '+05:30');

  // Return only the chosen key with value + timestamp
  return {
    type: chosenKey,
    value,
    timestamp: isoStringWithOffset
  };
}

// Example usage
console.log(generateData());


// Send data to Firebase at intervals
async function sendToFirebase() {
  try {
    const data = generateData();
    await db.collection('EMGData').add(data);
    console.log(`📤 Sent: ${data.type}, ${data.value}, ${data.timestamp}`);
  } catch (error) {
    console.error("❌ Error sending to Firebase:", error);
  }
}

// Start loop (every 2 seconds)
setInterval(sendToFirebase, 10000);

console.log("🚀 Mock ESP Server started — sending data to Firebase every 2s...");
