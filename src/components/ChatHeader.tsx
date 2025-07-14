import React from 'react';
import { Bot, Settings, Search } from 'lucide-react';

interface ChatHeaderProps {
  sessionTitle?: string;
  onSettings?: () => void;
  onSearch?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  sessionTitle = 'AI Assistant', 
  onSettings,
  onSearch 
}) => {
  return (
    <div className="chat-header">
      <div className="header-content">
        <div className="header-left">
          <div className="ai-avatar">
            <Bot size={20} />
          </div>
          <div className="header-info">
            <h1>{sessionTitle}</h1>
            <div className="status-indicator">
              <div className="status-dot" />
              <span>Online</span>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <button onClick={onSearch} className="icon-button" aria-label="Search">
            <Search size={18} />
          </button>
          <button onClick={onSettings} className="icon-button" aria-label="Settings">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
