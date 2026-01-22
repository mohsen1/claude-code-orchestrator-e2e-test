#!/usr/bin/env node

/**
 * Coverage Check Script
 * Reads coverage summary and checks against thresholds
 */

import { readFileSync } from 'fs';
import { exit } from 'process';

const THRESHOLDS = {
  statements: 80,
  branches: 75,
  functions: 80,
  lines: 80,
};

try {
  const coverageFile = './coverage/coverage-summary.json';
  const coverageData = JSON.parse(readFileSync(coverageFile, 'utf-8'));

  const { total } = coverageData;

  let failed = false;

  console.log('\n📊 Coverage Results:\n');

  for (const [metric, threshold] of Object.entries(THRESHOLDS)) {
    const coverage = total[metrics]?.pct || 0;
    const passed = coverage >= threshold;
    const icon = passed ? '✅' : '❌';
    const color = passed ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';

    console.log(
      `${icon} ${metric.padEnd(12)}: ${color}${coverage.toFixed(2)}%${reset} (threshold: ${threshold}%)`
    );

    if (!passed) {
      failed = true;
    }
  }

  console.log('');

  if (failed) {
    console.error('❌ Coverage check failed! Some metrics are below threshold.\n');
    exit(1);
  } else {
    console.log('✅ All coverage checks passed!\n');
    exit(0);
  }
} catch (error) {
  console.error('❌ Error reading coverage data:', error.message);
  exit(1);
}
