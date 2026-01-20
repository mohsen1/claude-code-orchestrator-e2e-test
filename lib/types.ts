import { User } from "@prisma/client";

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface AuthSession {
  user?: SessionUser;
  expires: string;
}
