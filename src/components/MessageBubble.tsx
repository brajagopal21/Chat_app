import React from 'react';
import { Bot, User, Download, FileText, AlertTriangle } from 'lucide-react';
import { Message } from '../types/chat';
import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (url: string, fileName: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className={`message ${isUser ? 'user' : 'ai'}`}>
      <div className={`message-avatar ${isUser ? 'user' : 'ai'}`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      
      <div className="message-content">
        <div className={`message-bubble ${isUser ? 'user' : 'ai'}`}>
          {message.error && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginBottom: '0.5rem',
              color: 'var(--error-color)',
              fontSize: '0.875rem'
            }}>
              <AlertTriangle size={16} />
              <span>Error: {message.error}</span>
            </div>
          )}
          
          {message.type === 'file' && message.fileUrl && (
            <div className="file-attachment">
              <FileText size={20} />
              <div className="file-info">
                <p className="file-name">{message.fileName}</p>
                <p className="file-size">{formatFileSize(message.fileSize || 0)}</p>
              </div>
              <button 
                onClick={() => handleDownload(message.fileUrl!, message.fileName!)}
                className="file-download"
                aria-label="Download file"
              >
                <Download size={16} />
              </button>
            </div>
          )}
          
          {message.type === 'image' && message.fileUrl && (
            <div>
              <img 
                src={message.fileUrl} 
                alt={message.fileName || 'Uploaded image'}
                className="file-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          {message.content && (
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {message.content}
            </div>
          )}
        </div>
        
        <div className="message-time">
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </div>
      </div>
    </div>
  );
};
