import { http } from './http';

export interface MessageResponse {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

export interface ConversationResponse {
  userId: string;
  name: string;
  avatarUrl?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const messageApi = {
  getConversations: (): Promise<ConversationResponse[]> => 
    http.get('/messages/conversations').then(res => res.data),
    
  getChatHistory: (otherUserId: string): Promise<MessageResponse[]> =>
    http.get(`/messages/${otherUserId}`).then(res => res.data)
};
