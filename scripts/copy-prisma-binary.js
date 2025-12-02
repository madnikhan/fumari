// Copy Prisma binary to .next directory for Vercel deployment
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../lib/prisma');
const targetDir = path.join(__dirname, '../.next/server/lib/prisma');
const binaryName = 'libquery_engine-debian-openssl-3.0.x.so.node';

const sourcePath = path.join(sourceDir, binaryName);
const targetPath = path.join(targetDir, binaryName);

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy binary if it exists
if (fs.existsSync(sourcePath)) {
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`✅ Copied ${binaryName} to .next/server/lib/prisma/`);
} else {
  console.warn(`⚠️  Binary ${binaryName} not found at ${sourcePath}`);
}

