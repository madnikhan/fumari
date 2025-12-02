// Quick connection test script
require('dotenv').config({ path: '.env.local' });

// Use dynamic import for ES modules
import('@prisma/client').then(({ PrismaClient }) => {

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    // Try a simple query
    await prisma.$connect();
    console.log('✅ Connection successful!');
    
    // Test query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query test successful:', result);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(error.message);
    
    if (error.message.includes("Can't reach database server")) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check if your Supabase database is paused');
      console.log('   → Go to: https://supabase.com/dashboard/project/nnsqtbdlwbgytgbxqguf');
      console.log('   → If paused, click "Restore"');
      console.log('');
      console.log('2. Try using Connection Pooling instead:');
      console.log('   → Go to: https://supabase.com/dashboard/project/nnsqtbdlwbgytgbxqguf/settings/database');
      console.log('   → Click "Connection pooling" tab');
      console.log('   → Copy that connection string');
      console.log('   → Update .env.local');
    }
    
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

testConnection();

