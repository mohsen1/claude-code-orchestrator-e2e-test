import Database from 'better-sqlite3';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  database: {
    connected: boolean;
    size: number;
    walMode: boolean;
    foreignKeys: boolean;
    tables: string[];
  };
  migrations: {
    current: number;
    latest: number;
    pending: number;
  };
  performance: {
    pageCount: number;
    pageSize: number;
    cacheSize: number;
  };
}

export function healthCheck(db: Database.Database): HealthCheckResult {
  try {
    const size = db.pragma('page_size', { simple: true }) as number;
    const pages = db.pragma('page_count', { simple: true }) as number;

    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      )
      .all() as Array<{ name: string }>;

    const currentVersion =
      (db
        .prepare('SELECT MAX(version) as v FROM schema_migrations')
        .get() as { v: number | null })?.v ?? 0;

    const migrations = db
      .prepare('SELECT COUNT(*) as c FROM schema_migrations')
      .get() as { c: number };

    return {
      status: 'healthy',
      database: {
        connected: db.open,
        size: size * pages,
        walMode: db.pragma('journal_mode', { simple: true }) === 'wal',
        foreignKeys: db.pragma('foreign_keys', { simple: true }) === 1,
        tables: tables.map((t) => t.name),
      },
      migrations: {
        current: currentVersion,
        latest: currentVersion,
        pending: 0,
      },
      performance: {
        pageCount: pages,
        pageSize: size,
        cacheSize: db.pragma('cache_size', { simple: true }) as number,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      database: {
        connected: false,
        size: 0,
        walMode: false,
        foreignKeys: false,
        tables: [],
      },
      migrations: {
        current: 0,
        latest: 0,
        pending: 0,
      },
      performance: {
        pageCount: 0,
        pageSize: 0,
        cacheSize: 0,
      },
    };
  }
}

export function optimizeDatabase(db: Database.Database): void {
  db.pragma('optimize');
  db.pragma('analyze');
}

export function vacuumDatabase(db: Database.Database): void {
  db.pragma('wal_checkpoint(TRUNCATE)');
  db.vacuum();
}

export function getDatabaseStats(db: Database.Database) {
  return {
    users: db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number },
    groups: db.prepare('SELECT COUNT(*) as c FROM groups').get() as { c: number },
    expenses: db.prepare('SELECT COUNT(*) as c FROM expenses').get() as { c: number },
    settlements: db.prepare('SELECT COUNT(*) as c FROM settlements').get() as { c: number },
    sessions: db.prepare('SELECT COUNT(*) as c FROM sessions').get() as { c: number },
  };
}
