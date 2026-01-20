#!/usr/bin/env node

/**
 * Group Management System - Validation Script
 *
 * This script validates that all necessary files and dependencies
 * are properly configured for the group management system.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const requiredFiles = [
  'lib/db/schema.ts',
  'lib/db/index.ts',
  'lib/db/migrate.ts',
  'lib/db/init.ts',
  'lib/actions/groups.ts',
  'lib/types/groups.ts',
  'app/api/groups/route.ts',
  'app/api/groups/[id]/route.ts',
  'app/api/groups/[id]/members/[userId]/route.ts',
];

const requiredDependencies = [
  'drizzle-orm',
  'better-sqlite3',
  'zod',
];

const requiredDevDependencies = [
  '@types/better-sqlite3',
];

function checkFile(filePath: string): boolean {
  const fullPath = join(process.cwd(), filePath);
  if (!existsSync(fullPath)) {
    console.error(`❌ Missing: ${filePath}`);
    return false;
  }
  console.log(`✅ Found: ${filePath}`);
  return true;
}

function checkDependencies() {
  try {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
    );

    console.log('\n📦 Checking dependencies...');
    let allGood = true;

    for (const dep of requiredDependencies) {
      if (packageJson.dependencies?.[dep]) {
        console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
      } else {
        console.error(`❌ Missing dependency: ${dep}`);
        allGood = false;
      }
    }

    for (const dep of requiredDevDependencies) {
      if (packageJson.devDependencies?.[dep]) {
        console.log(`✅ ${dep}: ${packageJson.devDependencies[dep]}`);
      } else {
        console.error(`❌ Missing dev dependency: ${dep}`);
        allGood = false;
      }
    }

    return allGood;
  } catch (error) {
    console.error('❌ Failed to read package.json');
    return false;
  }
}

function main() {
  console.log('🔍 Validating Group Management System...\n');

  let allGood = true;

  // Check required files
  console.log('📁 Checking required files...');
  for (const file of requiredFiles) {
    if (!checkFile(file)) {
      allGood = false;
    }
  }

  // Check dependencies
  if (!checkDependencies()) {
    allGood = false;
  }

  console.log('\n' + '='.repeat(50));

  if (allGood) {
    console.log('✅ All checks passed!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npx tsx lib/db/migrate.ts');
    console.log('2. Start the dev server: npm run dev');
    console.log('3. Start building your expense-sharing features!');
  } else {
    console.log('❌ Some checks failed. Please fix the issues above.');
    process.exit(1);
  }
}

main();
