#!/usr/bin/env node

/**
 * Script to switch Prisma schema from PostgreSQL to SQLite for local development
 * Run: node scripts/switch-to-sqlite.js
 */

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

try {
  let schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Check current provider
  if (schema.includes('provider = "sqlite"')) {
    console.log('✅ Schema is already set to SQLite');
    process.exit(0);
  }
  
  // Backup original schema
  const backupPath = schemaPath + '.postgresql.backup';
  fs.writeFileSync(backupPath, schema);
  console.log('📦 Backup created:', backupPath);
  
  // Switch to SQLite
  schema = schema.replace(/provider = "postgresql"/g, 'provider = "sqlite"');
  schema = schema.replace(/binaryTargets = \["native", "debian-openssl-3.0.x"\]/g, 'binaryTargets = ["native"]');
  
  // Update URL to use file: for SQLite
  schema = schema.replace(/url\s*=\s*env\("DATABASE_URL"\)/g, 'url      = env("DATABASE_URL")');
  
  fs.writeFileSync(schemaPath, schema);
  console.log('✅ Schema switched to SQLite');
  console.log('📝 Remember to run: npm run db:generate');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

