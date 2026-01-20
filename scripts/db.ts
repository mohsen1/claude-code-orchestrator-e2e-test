#!/usr/bin/env ts-node
import { getDatabaseClient } from '../src/db/client';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  const db = getDatabaseClient();

  try {
    switch (command) {
      case 'migrate':
        await db.getMigrationRunner().migrate();
        break;

      case 'rollback':
        const steps = args[1] ? parseInt(args[1], 10) : 1;
        await db.getMigrationRunner().rollback(steps);
        break;

      case 'status':
        const status = await db.getMigrationRunner().status();
        console.log('Migration Status:');
        console.log(`  Current Version: ${status.current}`);
        console.log(`  Latest Version: ${status.latest}`);
        console.log(`  Pending Migrations: ${status.pending.length}`);
        if (status.pending.length > 0) {
          console.log('  Pending:');
          status.pending.forEach((m) => {
            console.log(`    - ${m.version}: ${m.name}`);
          });
        }
        break;

      case 'history':
        const history = db.getMigrationRunner().getMigrationHistory();
        console.log('Migration History:');
        history.forEach((h) => {
          const date = new Date(h.applied_at * 1000).toISOString();
          console.log(`  ${h.version}: ${date}`);
        });
        break;

      case 'reset':
        console.log('⚠️  This will delete all data. Type "yes" to confirm:');
        process.stdin.once('data', (data) => {
          if (data.toString().trim() === 'yes') {
            db.getMigrationRunner().reset();
          } else {
            console.log('Reset cancelled');
          }
          process.exit(0);
        });
        return;

      case 'backup':
        const backupPath = args[1] || `backup-${Date.now()}.db`;
        db.backup(backupPath);
        break;

      default:
        console.log(`
Usage: npm run db <command> [options]

Commands:
  migrate              Run pending migrations
  rollback [steps]     Rollback N migrations (default: 1)
  status               Show migration status
  history              Show migration history
  reset                Reset database (requires confirmation)
  backup [path]        Create backup (default: backup-{timestamp}.db)

Examples:
  npm run db migrate
  npm run db rollback 2
  npm run db status
  npm run db backup ./backups/my-backup.db
        `);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    if (command !== 'reset') {
      db.close();
    }
  }
}

main();
