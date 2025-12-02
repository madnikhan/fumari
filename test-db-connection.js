// Quick test to verify database connection and check if tables exist
// Use the same import as the app
const { prisma } = require('./lib/prisma-client');

// prisma is already instantiated from prisma-client

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Connected to database successfully!');
    
    // Check if User table exists
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ User table exists! Found ${userCount} users.`);
    } catch (error) {
      if (error.code === 'P2021' || error.message.includes('does not exist')) {
        console.log('❌ User table does NOT exist!');
        console.log('   → Run: npm run db:push');
      } else {
        throw error;
      }
    }
    
    // Check if Table table exists
    try {
      const tableCount = await prisma.table.count();
      console.log(`✅ Table table exists! Found ${tableCount} tables.`);
    } catch (error) {
      if (error.code === 'P2021' || error.message.includes('does not exist')) {
        console.log('❌ Table table does NOT exist!');
        console.log('   → Run: npm run db:push');
      } else {
        throw error;
      }
    }
    
    console.log('\n✅ Database connection test completed!');
    
  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'P1001') {
      console.error('\n💡 Fix: Check if Supabase project is active (not paused)');
      console.error('   → Go to Supabase Dashboard → Project Settings → Check status');
    } else if (error.code === 'P1000') {
      console.error('\n💡 Fix: Check DATABASE_URL password is correct');
    } else {
      console.error('\n💡 Check your DATABASE_URL in .env.local');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

