import React, { useEffect } from 'react';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatHeader } from './components/ChatHeader';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';
import { TypingIndicator } from './components/TypingIndicator';
import { EmptyState } from './components/EmptyState';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useChat } from './hooks/useChat';
import { AlertTriangle, RefreshCw } from 'lucide-react';

function App() {
  const {
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
  } = useChat();

  useEffect(() => {
    // Create initial session on app load
    if (chatSessions.length === 0) {
      createNewSession();
    }
  }, [chatSessions.length, createNewSession]);

  const currentSession = chatSessions.find(session => session.id === currentSessionId);

  const handleSettings = () => {
    alert('Settings functionality would be implemented here');
  };

  const handleSearch = () => {
    alert('Search functionality would be implemented here');
  };

  return (
    <ErrorBoundary>
      <div className="app-container">
        <ChatSidebar
          sessions={chatSessions}
          currentSessionId={currentSessionId}
          onCreateNew={createNewSession}
          onLoadSession={loadSession}
          onDeleteSession={deleteSession}
        />
        
        <div className="main-content">
          <ChatHeader 
            sessionTitle={currentSession?.title || 'AI Assistant'}
            onSettings={handleSettings}
            onSearch={handleSearch}
          />
          
          <div className="messages-container">
            {error && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <AlertTriangle size={20} style={{ color: 'var(--error-color)' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--error-color)', fontWeight: 500 }}>
                    {error.message}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Error Code: {error.code}
                  </p>
                </div>
                <button
                  onClick={clearError}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--error-color)',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  ×
                </button>
                <button
                  onClick={retryLastMessage}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--error-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <RefreshCw size={16} />
                  Retry
                </button>
              </div>
            )}
            
            {messages.length === 0 && !error ? (
              <EmptyState onSampleMessage={sendMessage} />
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                
                {isTyping && <TypingIndicator />}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          <ChatInput 
            onSendMessage={sendMessage} 
            disabled={isLoading}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
