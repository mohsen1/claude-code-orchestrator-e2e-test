import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Simple database health check
    db.select({ count: 1 }).from({ count: 1 }).get();

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database connection failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
