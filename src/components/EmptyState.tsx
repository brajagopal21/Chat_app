import React from 'react';
import { MessageCircle, Sparkles, Upload, FileText } from 'lucide-react';

interface EmptyStateProps {
  onSampleMessage: (message: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSampleMessage }) => {
  const samplePrompts = [
    'Help me write a professional email',
    'Explain quantum computing in simple terms',
    'Create a project timeline for a new app',
    'Summarize the latest tech trends',
    'Draft a business proposal outline',
    'Analyze market research data',
    'Generate creative content ideas',
    'Review and improve code quality'
  ];

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Sparkles size={28} />
      </div>
      
      <h2>Welcome to AI Chat Enterprise</h2>
      <p>
        Your intelligent assistant is ready to help with any task. Start a conversation or try one of these examples:
      </p>
      
      <div className="sample-prompts">
        {samplePrompts.slice(0, 4).map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSampleMessage(prompt)}
            className="sample-prompt"
          >
            <div className="sample-prompt-content">
              <MessageCircle size={16} className="sample-prompt-icon" />
              <span className="sample-prompt-text">{prompt}</span>
            </div>
          </button>
        ))}
      </div>
      
      <div className="empty-state-features">
        <div className="feature-item">
          <Upload size={16} />
          <span>Upload files</span>
        </div>
        <div className="feature-item">
          <FileText size={16} />
          <span>Process documents</span>
        </div>
        <div className="feature-item">
          <Sparkles size={16} />
          <span>AI-powered responses</span>
        </div>
      </div>
    </div>
  );
};
