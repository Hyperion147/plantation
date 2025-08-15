#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🌱 Plantation Tracker Setup\n');
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    const overwrite = await question('Environment file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }

  console.log('\n📝 Firebase Configuration:');
  const firebaseApiKey = await question('Firebase API Key: ');
  const firebaseAuthDomain = await question('Firebase Auth Domain: ');
  const firebaseProjectId = await question('Firebase Project ID: ');
  const firebaseStorageBucket = await question('Firebase Storage Bucket: ');
  const firebaseMessagingSenderId = await question('Firebase Messaging Sender ID: ');
  const firebaseAppId = await question('Firebase App ID: ');
  const firebaseMeasurementId = await question('Firebase Measurement ID (optional): ');

  console.log('\n🗄️ Database Configuration:');
  const dbUser = await question('Database User: ');
  const dbHost = await question('Database Host (localhost): ') || 'localhost';
  const dbName = await question('Database Name (plantation_db): ') || 'plantation_db';
  const dbPassword = await question('Database Password: ');
  const dbPort = await question('Database Port (5432): ') || '5432';

  console.log('\n🔧 Firebase Admin Configuration:');
  const firebaseClientEmail = await question('Firebase Service Account Email: ');
  const firebasePrivateKey = await question('Firebase Private Key: ');

  const envContent = `# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=${firebaseApiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${firebaseAuthDomain}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${firebaseProjectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${firebaseStorageBucket}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${firebaseMessagingSenderId}
NEXT_PUBLIC_FIREBASE_APP_ID=${firebaseAppId}
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${firebaseMeasurementId}

# Firebase Admin (for server-side operations)
FIREBASE_PROJECT_ID=${firebaseProjectId}
FIREBASE_CLIENT_EMAIL=${firebaseClientEmail}
FIREBASE_PRIVATE_KEY=${firebasePrivateKey}

# Database Configuration
DATABASE_URL=postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}
DB_USER=${dbUser}
DB_HOST=${dbHost}
DB_NAME=${dbName}
DB_PASSWORD=${dbPassword}
DB_PORT=${dbPort}
`;

  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Environment file created successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Set up your PostgreSQL database with PostGIS extension');
  console.log('2. Run: psql -d plantation_db -f database/schema.sql');
  console.log('3. Install dependencies: npm install');
  console.log('4. Start the development server: npm run dev');
  
  rl.close();
}

setup().catch(console.error);
