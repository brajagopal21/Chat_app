import React from 'react';
import { Plus, MessageCircle, Trash2, Clock } from 'lucide-react';
import { ChatSession } from '../types/chat';
import { formatDistanceToNow } from 'date-fns';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onCreateNew: () => void;
  onLoadSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  currentSessionId,
  onCreateNew,
  onLoadSession,
  onDeleteSession,
}) => {
  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat session?')) {
      onDeleteSession(sessionId);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button onClick={onCreateNew} className="new-chat-button">
          <Plus size={20} />
          New Chat
        </button>
      </div>
      
      <div className="sessions-list">
        {sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No chat sessions yet
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`session-item ${currentSessionId === session.id ? 'active' : ''}`}
              onClick={() => onLoadSession(session.id)}
            >
              <div className="session-header">
                <MessageCircle size={18} className="session-icon" />
                <div className="session-content">
                  <h3 className="session-title">{session.title}</h3>
                  <p className="session-preview">{session.lastMessage}</p>
                  <div className="session-meta">
                    <Clock size={12} />
                    <span>{formatDistanceToNow(session.timestamp, { addSuffix: true })}</span>
                    <span>•</span>
                    <span>{session.messageCount} messages</span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  className="session-delete"
                  aria-label="Delete session"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
