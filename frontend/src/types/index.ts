export interface User {
  id: string;
  name: string;
  avatar: string;
  username?: string;
  isCurrentUser?: boolean;
  isHost?: boolean;
  role?: 'listener' | 'artist' | 'admin' | 'moderator';
}

/**
 * Shared TypeScript interfaces for the music streaming application
 */

// === Track & Music ===
export interface Track {
  id: string;
  title: string;
  artistId: string;
  artistName?: string;
  albumId?: string;
  audioUrl: string;
  coverUrl?: string;
  trackNumber?: number;
  duration?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LyricLine {
  time: number;
  text: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  isCurrentUser?: boolean;
  followers?: number;
  following?: number;
  playlistIds?: string[];
  recentlyPlayed?: string[];
  singingSessions?: number;
  listeningRooms?: number;
  isFollowing?: boolean;
  role?: 'listener' | 'artist' | 'admin' | 'moderator';
}

export interface AdminStats {
  totalUsers: number;
  totalArtists: number;
  totalTracks: number;
  totalRevenue: number;
  revenueGrowth: number;
  userGrowth: number;
  monthlyRevenue: { month: string; amount: number }[];
}

// === Playlist ===
export interface Playlist {
  id: string;
  name: string;
  cover: string;
  description: string;
  owner: string;
  ownerId: string;
  trackIds: string[];
  followers: number;
}

// === Messaging ===
export interface Conversation {
  id: string;
  participantId: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

// === Room (Listen Together) ===
export interface Room {
  id: string;
  name: string;
  code: string;
  hostId: string;
  participants: string[];
  currentTrackId: string;
  isPlaying: boolean;
}

// === Categories ===
export interface Category {
  id: string;
  name: string;
  color: string;
}

// === Chat Messages (Room) ===
export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

// === Context Menu ===
export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
}

export interface ContextMenuItem {
  label: string;
  icon?: string;
  action: () => void;
  danger?: boolean;
}
