import { useEffect, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './useAuth';
import type { MessageResponse } from '../api/message.api';

// Adjust based on your environment variable
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5213';

export const useChat = () => {
  const { isAuthenticated } = useAuth();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [readEvent, setReadEvent] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('token');
    
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/chathub`, {
        accessTokenFactory: () => token || ''
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log('Connected to Chat Hub');

          connection.on('ReceiveMessage', (message: MessageResponse) => {
            setMessages(prev => [...prev, message]);
          });

          connection.on('MessagesRead', (readerId: string) => {
            setReadEvent(readerId + '-' + Date.now());
          });
        })
        .catch(err => console.error('SignalR Connection Error: ', err));
    }
  }, [connection]);

  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (connection?.state === signalR.HubConnectionState.Connected) {
      await connection.invoke('SendMessage', receiverId, content);
    } else {
      console.error('No connection to server yet.');
    }
  }, [connection]);

  const markAsRead = useCallback(async (senderId: string) => {
    if (connection?.state === signalR.HubConnectionState.Connected) {
      await connection.invoke('MarkAsRead', senderId);
    }
  }, [connection]);

  return {
    connection,
    messages,
    sendMessage,
    markAsRead,
    readEvent
  };
};
