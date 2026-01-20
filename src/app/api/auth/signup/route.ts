import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDatabase } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // TODO: Implement actual user creation logic with database
    // const db = getDatabase();
    //
    // // Check if user already exists
    // const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    // if (existingUser) {
    //   return NextResponse.json(
    //     { error: "User already exists" },
    //     { status: 400 }
    //   );
    // }
    //
    // // Hash password and create user
    // const hashedPassword = await bcrypt.hash(password, 10);
    // const result = db.prepare(
    //   "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
    // ).run(name, email, hashedPassword);
    //
    // // Create default group for new user
    // const groupId = db.prepare(
    //   "INSERT INTO groups (name, created_by) VALUES (?, ?)"
    // ).run("My Expenses", result.lastInsertRowid);

    // Placeholder response
    return NextResponse.json(
      { message: "Signup endpoint - To be implemented with NextAuth" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
