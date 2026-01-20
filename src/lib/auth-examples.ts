/**
 * Example implementations using the NextAuth authentication system
 * This file serves as documentation and reference for using auth in your app
 */

// ============================================
// SERVER COMPONENT EXAMPLE
// ============================================
/*
import { getCurrentUser, requireAuth } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Option 1: Get user and redirect if not authenticated
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Option 2: Use requireAuth helper (throws if not authenticated)
  const authenticatedUser = await requireAuth();

  // Fetch user-specific data
  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
  });

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
      {/* Render groups *\/}
    </div>
  );
}
*/

// ============================================
// CLIENT COMPONENT EXAMPLE
// ============================================
/*
"use client";

import { useAuth } from "@/hooks/use-session";
import { signOut } from "@/lib/auth-utils";

export function UserProfile() {
  const { user, isAuthenticated, isLoading } = useAuth({
    redirectIfNotAuth: true,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div>
      <img src={user.image || ""} alt={user.name || ""} />
      <h2>Welcome, {user.name}</h2>
      <p>{user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
*/

// ============================================
// SERVER ACTION EXAMPLE
// ============================================
/*
"use server";

import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createExpense(formData: FormData) {
  // Ensure user is authenticated
  const user = await requireAuth();

  // Extract form data
  const title = formData.get("title") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const groupId = formData.get("groupId") as string;

  // Verify user is a member of the group
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: user.id,
      },
    },
  });

  if (!membership) {
    throw new Error("You are not a member of this group");
  }

  // Create expense
  const expense = await prisma.expense.create({
    data: {
      title,
      amount,
      groupId,
      paidBy: user.id,
    },
  });

  revalidatePath(`/groups/${groupId}`);
  return expense;
}
*/

// ============================================
// ROUTE HANDLER EXAMPLE
// ============================================
/*
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Authenticate the request
    const user = await requireAuth();

    // Get user's groups
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const group = await prisma.group.create({
      data: {
        name: body.name,
        description: body.description,
        createdBy: user.id,
        members: {
          create: {
            userId: user.id,
          },
        },
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
*/

// ============================================
// MIDDLEWARE CUSTOMIZATION EXAMPLE
// ============================================
/*
// To add more public routes, update middleware.ts:

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        const publicRoutes = [
          "/",
          "/login",
          "/about",
          "/api/auth",
          "/api/public",
        ];

        const isPublicRoute = publicRoutes.some((route) =>
          pathname.startsWith(route)
        );

        return isPublicRoute || !!token;
      },
    },
  }
);
*/

// ============================================
// ROOT LAYOUT WITH SESSION PROVIDER
// ============================================
/*
import { SessionProvider } from "@/components/providers/session-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
*/

// ============================================
// LOGIN PAGE EXAMPLE
// ============================================
/*
"use client";

import { signIn } from "next-auth/react";
import { useAuth } from "@/hooks/use-session";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { isAuthenticated } = useAuth({
    redirectIfAuth: true,
  });
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-3xl font-bold">Sign in to your account</h2>
        </div>
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
*/
