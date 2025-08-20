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

  console.log('\n📝 Supabase Configuration:');
  const supabaseUrl = await question('Supabase URL: ');
  const supabaseAnonKey = await question('Supabase Anon Key: ');
  const supabaseServiceKey = await question('Supabase Service Role Key: ');

  console.log('\n🗄️ Database Configuration:');
  const dbUser = await question('Database User: ');
  const dbHost = await question('Database Host (localhost): ') || 'localhost';
  const dbName = await question('Database Name (plantation_db): ') || 'plantation_db';
  const dbPassword = await question('Database Password: ');
  const dbPort = await question('Database Port (5432): ') || '5432';

  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

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
  console.log('1. Set up your Supabase project');
  console.log('2. Enable Google OAuth in Supabase Auth settings');
  console.log('3. Create a storage bucket named "plants" in Supabase Storage');
  console.log('4. Run the Supabase schema: psql -d plantation_db -f database/supabase-schema.sql');
  console.log('5. Install dependencies: npm install');
  console.log('6. Start the development server: npm run dev');
  
  rl.close();
}

setup().catch(console.error);
