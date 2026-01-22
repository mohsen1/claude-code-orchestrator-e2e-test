#!/usr/bin/env node

/**
 * File Size Check Script
 * Checks if staged files exceed size limits
 */

import { execSync } from 'child_process';
import { statSync } from 'fs';
import { exit } from 'process';

const MAX_FILE_SIZE = 1024 * 500; // 500KB
const EXTENSIONS_TO_CHECK = ['.js', '.jsx', '.ts', '.tsx', '.json'];

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
    });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
}

function checkFileSize(filePath) {
  try {
    const stats = statSync(filePath);
    const sizeKB = stats.size / 1024;

    if (sizeKB > MAX_FILE_SIZE / 1024) {
      console.warn(
        `⚠️  Warning: ${filePath} is ${sizeKB.toFixed(2)}KB (exceeds ${MAX_FILE_SIZE / 1024}KB limit)`
      );
      return false;
    }

    return true;
  } catch (error) {
    return true; // File doesn't exist or can't be read, skip
  }
}

function main() {
  const stagedFiles = getStagedFiles();
  const filesToCheck = stagedFiles.filter((file) =>
    EXTENSIONS_TO_CHECK.some((ext) => file.endsWith(ext))
  );

  if (filesToCheck.length === 0) {
    exit(0);
  }

  console.log('\n📏 Checking file sizes...\n');

  let allPassed = true;

  for (const file of filesToCheck) {
    if (!checkFileSize(file)) {
      allPassed = false;
    }
  }

  if (!allPassed) {
    console.warn(
      '\n⚠️  Some files exceed the recommended size limit. Consider splitting large files.\n'
    );
    // Don't fail the commit, just warn
  }

  exit(0);
}

main();
