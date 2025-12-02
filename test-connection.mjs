// Quick connection test script (ES Module)
import { config } from 'dotenv';
import { PrismaClient } from './lib/prisma/client/index.js';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    const dbUrl = process.env.DATABASE_URL || '';
    const hostMatch = dbUrl.match(/@([^:]+):(\d+)/);
    
    if (hostMatch) {
      console.log('📍 Host:', hostMatch[1]);
      console.log('🔌 Port:', hostMatch[2]);
      console.log('💡 Using pooling:', hostMatch[2] === '6543' ? 'YES ✓' : 'NO ✗ (should use 6543)');
    }
    
    console.log('\n🔄 Attempting to connect...');
    
    // Try a simple query
    await prisma.$connect();
    console.log('✅ Connection successful!');
    
    // Test query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query test successful:', result);
    
    await prisma.$disconnect();
    console.log('\n🎉 All tests passed! You can now run:');
    console.log('   npm run db:push');
    console.log('   npm run db:seed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed:');
    console.error('   ', error.message);
    
    if (error.message.includes("Can't reach database server")) {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Check if database is paused:');
      console.log('      → https://supabase.com/dashboard/project/nnsqtbdlwbgytgbxqguf');
      console.log('      → If paused, click "Restore"');
      console.log('');
      console.log('   2. Use Connection Pooling (port 6543):');
      console.log('      → https://supabase.com/dashboard/project/nnsqtbdlwbgytgbxqguf/settings/database');
      console.log('      → Click "Connection pooling" tab');
      console.log('      → Copy connection string');
      console.log('      → Update .env.local');
    }
    
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

testConnection();

