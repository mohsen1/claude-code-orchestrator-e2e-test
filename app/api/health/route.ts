import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

/**
 * Health check endpoint for monitoring and load balancers
 * Returns 200 OK if the service is healthy
 */
export async function GET(request: NextRequest) {
  const healthData = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    app: {
      name: process.env.NEXT_PUBLIC_APP_NAME || "SplitSync",
      version: process.env.NEXT_PUBLIC_APP_VERSION || "3.0.0",
      environment: process.env.NODE_ENV || "development",
    },
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  };

  return NextResponse.json(healthData, { status: 200 });
}
