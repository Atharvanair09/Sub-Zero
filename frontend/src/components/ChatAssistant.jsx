import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User as UserIcon } from 'lucide-react';

const ChatAssistant = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi! I am your SubZero Financial Assistant. Ask me how to save money or what to cancel!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, userId })
      });
      const data = await response.json();
      
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I am having trouble connecting to my neural network right now.' }]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        className={`chat-fab ${isOpen ? 'hidden' : ''}`} 
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare size={24} color="white" />
        <span className="fab-tooltip">Analyze Savings</span>
      </button>

      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'active' : ''}`}>
        <div className="chat-header">
          <div className="flex items-center gap-2">
            <div className="ai-avatar">
              <Bot size={18} color="white" />
            </div>
            <div>
              <h3>AI Concierge</h3>
              <p className="status">Online</p>
            </div>
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="chat-body">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.sender}`}>
              {msg.sender === 'ai' && <div className="b-avatar"><Bot size={14} /></div>}
              {msg.sender === 'user' && <div className="b-avatar user-av"><UserIcon size={14} /></div>}
              <div className="b-text">{msg.text.replace(/\*\*/g, '')}</div>
            </div>
          ))}
          {isTyping && (
            <div className="chat-bubble ai typing">
               <div className="b-avatar"><Bot size={14} /></div>
               <div className="b-text dots">
                 <span>.</span><span>.</span><span>.</span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Ask me anything..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={!input.trim()}><Send size={18} /></button>
        </form>
      </div>

      <style>{`
        .chat-fab {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
          z-index: 50;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .chat-fab:hover {
          transform: scale(1.1);
        }
        .chat-fab.hidden {
          transform: scale(0) translateY(20px) !important;
          opacity: 0;
          pointer-events: none;
        }
        .fab-tooltip {
          position: absolute;
          right: 70px;
          background: #1e293b;
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transform: translateX(10px);
          transition: all 0.3s;
        }
        .chat-fab:hover .fab-tooltip {
          opacity: 1;
          transform: translateX(0);
        }

        .chat-window {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 350px;
          height: 500px;
          background: white;
          border-radius: 1.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          z-index: 100;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          transform: translateY(20px) scale(0.95);
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .chat-window.active {
          transform: translateY(0) scale(1);
          opacity: 1;
          pointer-events: auto;
        }

        .chat-header {
          background: linear-gradient(135deg, #1e1b4b, #312e81);
          padding: 1rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
        }
        .ai-avatar {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .chat-header h3 { font-size: 0.95rem; font-weight: 700; margin: 0; }
        .chat-header .status { font-size: 0.7rem; color: #a5b4fc; margin: 0; }
        .chat-header .close-btn { background: none; border: none; color: white; cursor: pointer; opacity: 0.7; }
        .chat-header .close-btn:hover { opacity: 1; }

        .chat-body {
          flex: 1;
          padding: 1.25rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: #f8fafc;
        }

        .chat-bubble {
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
          max-width: 85%;
        }
        .chat-bubble.ai { align-self: flex-start; }
        .chat-bubble.user { align-self: flex-end; flex-direction: row-reverse; }

        .b-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e0e7ff;
          color: #4f46e5;
          flex-shrink: 0;
        }
        .b-avatar.user-av { background: #e2e8f0; color: #475569; }

        .b-text {
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          font-size: 0.85rem;
          line-height: 1.4;
        }
        .ai .b-text { background: white; border: 1px solid #e2e8f0; border-bottom-left-radius: 0.25rem; color: #1e293b; }
        .user .b-text { background: #4f46e5; color: white; border-bottom-right-radius: 0.25rem; }

        .typing .b-text {
          padding: 0.5rem 1rem;
        }
        .dots {
          display: flex;
          gap: 2px;
        }
        .dots span {
          animation: blink 1.4s infinite both;
          height: 6px; width: 6px; background: #94a3b8; border-radius: 50%; display: block;
        }
        .dots span:nth-child(2) { animation-delay: 0.2s; }
        .dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink { 0% { opacity: 0.2; transform: scale(0.8); } 20% { opacity: 1; transform: scale(1); } 100% { opacity: 0.2; transform: scale(0.8); } }

        .chat-input-area {
          padding: 1rem;
          background: white;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .chat-input-area input {
          flex: 1;
          padding: 0.6rem 1rem;
          border: 1px solid #cbd5e1;
          border-radius: 2rem;
          font-size: 0.85rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .chat-input-area input:focus { border-color: #6366f1; }
        .chat-input-area button {
          background: #6366f1;
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .chat-input-area button:disabled { background: #94a3b8; cursor: not-allowed; }
      `}</style>
    </>
  );
};

export default ChatAssistant;
