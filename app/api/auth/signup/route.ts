import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"

const signupSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = signupSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, email, password } = validation.data

    // TODO: Check if user already exists in database
    // const existingUser = await db.user.findUnique({
    //   where: { email }
    // })
    //
    // if (existingUser) {
    //   return NextResponse.json(
    //     { error: "User already exists" },
    //     { status: 400 }
    //   )
    // }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // TODO: Create user in database
    // const user = await db.user.create({
    //   data: {
    //     name,
    //     email,
    //     password: hashedPassword,
    //   }
    // })

    // For now, return success
    // In production, you would also:
    // 1. Send verification email
    // 2. Create a session using NextAuth
    // 3. Return appropriate user data

    return NextResponse.json(
      {
        message: "Account created successfully",
        // user: { id: user.id, name: user.name, email: user.email }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
