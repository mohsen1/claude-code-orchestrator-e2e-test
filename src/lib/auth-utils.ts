import { db } from "./db";
import { hash } from "bcrypt";

export interface User {
  id: string;
  email: string;
  name: string;
  image: string | null;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = db
      .prepare(
        "SELECT id, email, name, image, password, created_at as createdAt, updated_at as updatedAt FROM users WHERE email = ?"
      )
      .get(email) as any;

    return user || null;
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const user = db
      .prepare(
        "SELECT id, email, name, image, password, created_at as createdAt, updated_at as updatedAt FROM users WHERE id = ?"
      )
      .get(id) as any;

    return user || null;
  } catch (error) {
    console.error("Error getting user by id:", error);
    return null;
  }
}

export async function createUser(data: {
  email: string;
  name: string;
  password?: string;
  image?: string | null;
  provider?: string;
}): Promise<User | null> {
  try {
    const hashedPassword = data.password
      ? await hash(data.password, 10)
      : null;

    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    db.prepare(
      `INSERT INTO users (id, email, name, password, image, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      data.email,
      data.name,
      hashedPassword,
      data.image || null,
      now,
      now
    );

    return await getUserById(id);
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function updateUser(
  id: string,
  data: Partial<{
    name: string;
    email: string;
    password: string;
    image: string | null;
  }>
): Promise<User | null> {
  try {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name) {
      updates.push("name = ?");
      values.push(data.name);
    }

    if (data.email) {
      updates.push("email = ?");
      values.push(data.email);
    }

    if (data.password) {
      updates.push("password = ?");
      values.push(await hash(data.password, 10));
    }

    if (data.image !== undefined) {
      updates.push("image = ?");
      values.push(data.image);
    }

    updates.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);

    db.prepare(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`
    ).run(...values);

    return await getUserById(id);
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    const result = db.prepare("DELETE FROM users WHERE id = ?").run(id);
    return result.changes > 0;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}

export async function linkOAuthAccount(
  userId: string,
  provider: string,
  providerAccountId: string
): Promise<void> {
  try {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    db.prepare(
      `INSERT OR IGNORE INTO accounts (id, user_id, provider, provider_account_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, userId, provider, providerAccountId, now, now);
  } catch (error) {
    console.error("Error linking OAuth account:", error);
  }
}

export async function verifyPassword(
  email: string,
  password: string
): Promise<boolean> {
  const user = await getUserByEmail(email);
  if (!user || !user.password) {
    return false;
  }

  const { compare } = await import("bcrypt");
  return await compare(password, user.password);
}
