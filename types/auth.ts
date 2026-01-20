export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: UserPayload;
  error?: string;
}

export interface UserPayload {
  id: number;
  email: string;
  name: string;
}

export interface JwtPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}
