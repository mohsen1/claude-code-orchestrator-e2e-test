import { NextResponse } from "next/server";
import { db } from "@/db";

export async function GET() {
  try {
    // Simple database health check
    db.select({ count: 1 }).from(db.$schema.users).limit(1).get();

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
