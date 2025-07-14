import { useState, useCallback, useRef, useEffect } from 'react';
import { Message, ChatSession, ChatError, FileUpload, ApiResponse } from '../types/chat';
import { faker } from '@faker-js/faker';

interface UseChatReturn {
  messages: Message[];
  chatSessions: ChatSession[];
  currentSessionId: string;
  isTyping: boolean;
  isLoading: boolean;
  error: ChatError | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  sendMessage: (content: string, type?: 'text' | 'file' | 'image', fileData?: FileUpload) => Promise<void>;
  createNewSession: () => void;
  loadSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => void;
  clearError: () => void;
  retryLastMessage: () => Promise<void>;
}

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<string>('');

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`Chat error in ${context}:`, error);
    
    let chatError: ChatError;
    
    if (error instanceof Error) {
      chatError = {
        code: 'GENERAL_ERROR',
        message: error.message,
        details: error.stack,
      };
    } else if (typeof error === 'string') {
      chatError = {
        code: 'GENERAL_ERROR',
        message: error,
      };
    } else {
      chatError = {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
        details: error,
      };
    }
    
    setError(chatError);
    setIsTyping(false);
    setIsLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const validateMessage = useCallback((content: string, type: 'text' | 'file' | 'image'): boolean => {
    if (!content.trim() && type === 'text') {
      handleError('Message cannot be empty', 'validateMessage');
      return false;
    }
    
    if (content.length > 10000) {
      handleError('Message is too long (max 10,000 characters)', 'validateMessage');
      return false;
    }
    
    return true;
  }, [handleError]);

  const validateFile = useCallback((file: File): boolean => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/csv',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (file.size > maxSize) {
      handleError('File size must be less than 50MB', 'validateFile');
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      handleError('File type not supported', 'validateFile');
      return false;
    }

    return true;
  }, [handleError]);

  const generateAIResponse = useCallback(async (userMessage: string): Promise<ApiResponse<string>> => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Simulate occasional errors
      if (Math.random() < 0.1) {
        throw new Error('AI service temporarily unavailable');
      }

      const responses = [
        `I understand you're asking about "${userMessage}". Here's what I can help you with...`,
        `Based on your message, I'd recommend considering these options...`,
        `That's an interesting question about "${userMessage}". Let me analyze that for you...`,
        `I can help you with that. Here are some insights regarding your query...`,
        `Thank you for sharing that. I've processed your request and here's my response...`,
        `Great question! Let me break this down for you step by step...`,
        `I see what you're looking for. Here are some comprehensive insights...`,
        `Based on my analysis, here are the key points to consider...`
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      return {
        data: response,
        success: true,
      };
    } catch (error) {
      return {
        data: '',
        success: false,
        error: {
          code: 'AI_ERROR',
          message: error instanceof Error ? error.message : 'Failed to generate response',
        },
      };
    }
  }, []);

  const sendMessage = useCallback(async (
    content: string,
    type: 'text' | 'file' | 'image' = 'text',
    fileData?: FileUpload
  ): Promise<void> => {
    try {
      clearError();
      
      if (!validateMessage(content, type)) {
        return;
      }

      if (fileData && !validateFile(fileData.file)) {
        return;
      }

      lastUserMessageRef.current = content;

      const userMessage: Message = {
        id: faker.string.uuid(),
        content,
        timestamp: new Date(),
        sender: 'user',
        type,
        fileUrl: fileData?.url,
        fileName: fileData?.name,
        fileSize: fileData?.size,
      };

      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);
      setIsLoading(true);

      const aiResponse = await generateAIResponse(content);
      
      if (!aiResponse.success) {
        throw new Error(aiResponse.error?.message || 'Failed to get AI response');
      }

      const aiMessage: Message = {
        id: faker.string.uuid(),
        content: aiResponse.data,
        timestamp: new Date(),
        sender: 'ai',
        type: 'text',
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update current session
      if (currentSessionId) {
        setChatSessions(prev => prev.map(session => 
          session.id === currentSessionId 
            ? { 
                ...session, 
                lastMessage: aiResponse.data.substring(0, 100) + (aiResponse.data.length > 100 ? '...' : ''),
                timestamp: new Date(), 
                messageCount: session.messageCount + 2 
              }
            : session
        ));
      }
    } catch (error) {
      handleError(error, 'sendMessage');
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  }, [currentSessionId, generateAIResponse, validateMessage, validateFile, handleError, clearError]);

  const retryLastMessage = useCallback(async (): Promise<void> => {
    if (lastUserMessageRef.current) {
      await sendMessage(lastUserMessageRef.current);
    }
  }, [sendMessage]);

  const createNewSession = useCallback(() => {
    try {
      const newSession: ChatSession = {
        id: faker.string.uuid(),
        title: `Chat Session ${chatSessions.length + 1}`,
        lastMessage: 'New conversation started',
        timestamp: new Date(),
        messageCount: 0,
      };
      
      setChatSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setMessages([]);
      clearError();
    } catch (error) {
      handleError(error, 'createNewSession');
    }
  }, [chatSessions.length, handleError, clearError]);

  const loadSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCurrentSessionId(sessionId);
      // In a real app, you'd load messages from the backend
      setMessages([]);
      
      // Update session as active
      setChatSessions(prev => prev.map(session => ({
        ...session,
        isActive: session.id === sessionId
      })));
    } catch (error) {
      handleError(error, 'loadSession');
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError]);

  const deleteSession = useCallback((sessionId: string) => {
    try {
      setChatSessions(prev => prev.filter(session => session.id !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId('');
        setMessages([]);
      }
    } catch (error) {
      handleError(error, 'deleteSession');
    }
  }, [currentSessionId, handleError]);

  return {
    messages,
    chatSessions,
    currentSessionId,
    isTyping,
    isLoading,
    error,
    messagesEndRef,
    sendMessage,
    createNewSession,
    loadSession,
    deleteSession,
    clearError,
    retryLastMessage,
  };
};
