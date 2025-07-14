import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, Image as ImageIcon, FileText, X } from 'lucide-react';
import { FileUpload } from '../types/chat';

interface ChatInputProps {
  onSendMessage: (message: string, type?: 'text' | 'file' | 'image', fileData?: FileUpload) => Promise<void>;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<FileUpload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!message.trim() && !attachedFile) || disabled || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const messageContent = message.trim() || (attachedFile ? `Uploaded ${attachedFile.name}` : '');
      const messageType = attachedFile ? 
        (attachedFile.type.startsWith('image/') ? 'image' : 'file') : 
        'text';
      
      await onSendMessage(messageContent, messageType, attachedFile || undefined);
      
      setMessage('');
      setAttachedFile(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const fileUrl = URL.createObjectURL(file);
        setAttachedFile({
          file,
          url: fileUrl,
          name: file.name,
          size: file.size,
          type: file.type,
        });
      } catch (error) {
        console.error('Failed to process file:', error);
      }
    }
  };

  const removeAttachment = () => {
    if (attachedFile) {
      URL.revokeObjectURL(attachedFile.url);
    }
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  return (
    <div className="chat-input-container">
      {attachedFile && (
        <div className="file-preview">
          {attachedFile.type.startsWith('image/') ? (
            <ImageIcon size={20} style={{ color: 'var(--primary-color)' }} />
          ) : (
            <FileText size={20} style={{ color: 'var(--primary-color)' }} />
          )}
          <div className="file-preview-info">
            <p className="file-preview-name">{attachedFile.name}</p>
            <p className="file-preview-size">
              {(attachedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button onClick={removeAttachment} className="remove-file" aria-label="Remove file">
            <X size={16} />
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="input-form">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
          disabled={disabled}
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="attach-button"
          disabled={disabled}
          aria-label="Attach file"
        >
          <Paperclip size={20} />
        </button>
        
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={disabled || isSubmitting}
            className="message-input"
            rows={1}
            style={{ resize: 'none', overflow: 'hidden' }}
          />
        </div>
        
        <button
          type="submit"
          disabled={(!message.trim() && !attachedFile) || disabled || isSubmitting}
          className="send-button"
          aria-label="Send message"
        >
          {isSubmitting ? (
            <div className="loading-spinner" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
    </div>
  );
};
