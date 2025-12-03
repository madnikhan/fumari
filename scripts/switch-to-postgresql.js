#!/usr/bin/env node

/**
 * Script to switch Prisma schema from SQLite to PostgreSQL for Vercel deployment
 * Run: node scripts/switch-to-postgresql.js
 */

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

try {
  let schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Check current provider
  if (schema.includes('provider = "postgresql"')) {
    console.log('✅ Schema is already set to PostgreSQL');
    process.exit(0);
  }
  
  // Backup original schema
  const backupPath = schemaPath + '.sqlite.backup';
  fs.writeFileSync(backupPath, schema);
  console.log('📦 Backup created:', backupPath);
  
  // Switch to PostgreSQL
  schema = schema.replace(/provider = "sqlite"/g, 'provider = "postgresql"');
  schema = schema.replace(/binaryTargets = \["native"\]/g, 'binaryTargets = ["native", "debian-openssl-3.0.x"]');
  
  fs.writeFileSync(schemaPath, schema);
  console.log('✅ Schema switched to PostgreSQL');
  console.log('📝 Remember to run: npm run db:generate');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

