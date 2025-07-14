import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="typing-indicator">
      <div className="message-avatar ai">
        <Bot size={16} />
      </div>
      
      <div className="message-content">
        <div className="typing-bubble">
          <div className="typing-dots">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        </div>
      </div>
    </div>
  );
};
