// Ensure Prisma binary is accessible for Vercel deployment
// Vercel needs the binary in lib/prisma, which should already be there
// This script just verifies it exists and logs for debugging
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../lib/prisma');
const binaryName = 'libquery_engine-debian-openssl-3.0.x.so.node';
const sourcePath = path.join(sourceDir, binaryName);

if (fs.existsSync(sourcePath)) {
  const stats = fs.statSync(sourcePath);
  console.log(`✅ Prisma binary found: ${binaryName} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`   Location: ${sourcePath}`);
} else {
  console.error(`❌ Prisma binary NOT found at ${sourcePath}`);
  console.error(`   This will cause runtime errors on Vercel!`);
  process.exit(1);
}

