import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '../../components/Icons/Icons';
import styles from './MessagesPage.module.css';
import { messageApi, type ConversationResponse, type MessageResponse } from '../../api/message.api';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { getCoverUrl, DEFAULT_PLAYLIST_COVER } from '../../utils/urlUtil';

const MessagesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const { connection, messages: incomingMessages, sendMessage, markAsRead, readEvent } = useChat();

  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<MessageResponse[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  const fetchConversations = async () => {
    try {
      const data = await messageApi.getConversations();
      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchConversations().then(() => {
        if (location.state?.userId && location.state.userId !== selectedConvId) {
          handleSelectConversation(location.state.userId);
        }
      });
    }
  }, [profile, location.state?.userId]);

  const displayConversations = useMemo(() => {
    const list = [...conversations];
    if (location.state?.userId) {
      const { userId, name, avatarUrl } = location.state;
      if (!list.find(c => c.userId === userId)) {
        list.unshift({
          userId,
          name,
          avatarUrl,
          lastMessage: '',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0
        });
      }
    }
    return list;
  }, [conversations, location.state]);

  // Handle incoming messages
  useEffect(() => {
    if (incomingMessages.length > 0) {
      const latestMsg = incomingMessages[incomingMessages.length - 1];
      
      // If it belongs to current open chat, append it
      if (selectedConvId && (latestMsg.senderId === selectedConvId || latestMsg.receiverId === selectedConvId)) {
        setChatHistory(prev => {
          // Prevent duplicates
          if (prev.find(m => m.id === latestMsg.id)) return prev;
          return [...prev, latestMsg];
        });

        // Mark as read immediately if it's incoming
        if (latestMsg.senderId === selectedConvId) {
          markAsRead(selectedConvId);
        }
      }

      // Refresh conversations list
      fetchConversations();
    }
  }, [incomingMessages]); // intentional missing dependency on selectedConvId so it runs every time a message arrives

  // Handle read event
  useEffect(() => {
    if (readEvent && selectedConvId) {
      // Refresh chat history to update read receipts
      loadHistory(selectedConvId);
    }
  }, [readEvent]);

  // Load history when selecting conversation
  const loadHistory = async (userId: string) => {
    try {
      const history = await messageApi.getChatHistory(userId);
      setChatHistory(history);
      
      // Also mark as read
      markAsRead(userId);
      // Update unread count locally
      setConversations(prev => prev.map(c => c.userId === userId ? { ...c, unreadCount: 0 } : c));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectConversation = (userId: string) => {
    setSelectedConvId(userId);
    loadHistory(userId);
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvId) return;

    try {
      await sendMessage(selectedConvId, newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const selectedConversation = displayConversations.find(c => c.userId === selectedConvId);

  const formatTime = (timeStr: string | number | Date) => {
    const d = new Date(timeStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.page}>
      {/* Conversation List */}
      <aside className={styles.sidebar}>
        <header className={styles.sidebarHeader}>
          <h1 className={styles.title}>Messages</h1>
          <button className={styles.newChatBtn} title="New chat">
            <Icon name="Plus" size={20} />
          </button>
        </header>

        <div className={styles.conversationList}>
          {displayConversations.map(conv => (
            <div
              key={conv.userId}
              className={`${styles.conversationItem} ${selectedConvId === conv.userId ? styles.active : ''}`}
              onClick={() => handleSelectConversation(conv.userId)}
            >
              <div className={styles.avatar}>
                <img src={conv.avatarUrl ? getCoverUrl(conv.avatarUrl) : DEFAULT_PLAYLIST_COVER} alt={conv.name} />
              </div>
              <div className={styles.convInfo}>
                <div className={styles.convHeader}>
                  <span className={styles.userName}>{conv.name}</span>
                  <span className={styles.time}>{formatTime(conv.lastMessageTime)}</span>
                </div>
                <p className={styles.lastMessage}>{conv.lastMessage}</p>
              </div>
              {conv.unreadCount > 0 && (
                <span className={styles.unreadBadge}>{conv.unreadCount}</span>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Chat Window */}
      <main className={styles.chatArea}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <header className={styles.chatHeader}>
              <div
                className={styles.chatUserInfo}
                onClick={() => navigate(`/profile/${selectedConversation.name}`)}
              >
                <div className={styles.chatAvatar}>
                  <img src={selectedConversation.avatarUrl ? getCoverUrl(selectedConversation.avatarUrl) : DEFAULT_PLAYLIST_COVER} alt={selectedConversation.name} />
                </div>
                <div>
                  <h2 className={styles.chatUserName}>{selectedConversation.name}</h2>
                </div>
              </div>
            </header>

            {/* Messages */}
            <div className={styles.messages}>
              {chatHistory.map(msg => {
                const isOutgoing = msg.senderId === profile?.userId;
                return (
                  <div
                    key={msg.id}
                    className={`${styles.message} ${isOutgoing ? styles.outgoing : styles.incoming}`}
                  >
                    <div className={styles.bubble}>
                      <p>{msg.content}</p>
                      <div className={styles.msgFooter}>
                        <span className={styles.msgTime}>
                          {formatTime(msg.sentAt)}
                        </span>
                        {isOutgoing && (
                          <span className={styles.readReceipt}>
                            <Icon name={msg.isRead ? "CheckCheck" : "Check"} size={14} color={msg.isRead ? "#4ade80" : "#a1a1aa"} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className={styles.inputArea} onSubmit={handleSendMessage}>
              <input
                type="text"
                className={styles.input}
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                type="submit"
                className={styles.sendBtn}
                disabled={!newMessage.trim()}
              >
                <Icon name="Send" size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className={styles.emptyState}>
            <Icon name="Message" size={64} />
            <h2>Select a conversation</h2>
            <p>Choose a conversation from the list to start chatting</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MessagesPage;
