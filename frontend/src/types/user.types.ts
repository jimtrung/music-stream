export type UserRole = "listener" | "artist" | "administrator";

export type Provider = "local" | "google";

export interface User {
  id: string,
  username: string,
  email: string,
  password: string,
  role: UserRole,
  provider: Provider,
  token?: string | null,
  isVerified: boolean,
  isPremium: boolean,
  createdAt: string,
  updatedAt: string
}
