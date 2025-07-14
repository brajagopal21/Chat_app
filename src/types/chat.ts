export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'ai';
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isTyping?: boolean;
  error?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
  isActive?: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
}

export interface ChatError {
  code: string;
  message: string;
  details?: unknown;
}

export interface FileUpload {
  file: File;
  url: string;
  name: string;
  size: number;
  type: string;
  isUploading?: boolean;
  error?: string;
}

export interface ChatState {
  messages: Message[];
  sessions: ChatSession[];
  currentSessionId: string;
  isTyping: boolean;
  isLoading: boolean;
  error: ChatError | null;
  user: User | null;
}

export interface ApiResponse<T> {
  data: T;
  error?: ChatError;
  success: boolean;
}
