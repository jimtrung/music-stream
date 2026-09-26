export interface Profile {
  userId: string,
  username: string,
  name: string,
  avatarUrl: string,
  isVerified?: boolean,
  isPremium?: boolean,
  role?: 'listener' | 'artist' | 'admin' | 'moderator',
  createdAt: string,
  updatedAt: string
}
