
export type UserRole = "USER" | "ADMIN";

export interface AuthUser {
  email: string;
  username: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  email: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}