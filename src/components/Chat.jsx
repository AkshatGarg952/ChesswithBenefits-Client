import { MessageCircle, Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { socket } from "../socket/SocketConnection.js";

const Chat = ({ className = "", messages, onSendMessage, roomId }) => {
  const [newMessage, setNewMessage] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function formatTime12Hour(isoTime) {
    return new Date(isoTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socket.emit("SendMessage", { message: newMessage, roomId });
      onSendMessage({ id: Date.now(), message: newMessage, isSent: true, time: new Date().toISOString() });
      setNewMessage('');
    }
  };

  return (
    <div className={`flex flex-col rounded-2xl overflow-hidden ${className}`}
      style={{ background: 'linear-gradient(145deg, rgba(18,15,28,0.95), rgba(12,10,20,0.98))', border: '1px solid rgba(201,168,76,0.12)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3" style={{ borderBottom: '1px solid rgba(201,168,76,0.1)', background: 'rgba(201,168,76,0.04)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <MessageCircle style={{ width: '14px', height: '14px', color: '#c9a84c' }} />
        </div>
        <span className="text-sm font-semibold" style={{ color: 'rgba(220,210,185,0.85)' }}>Chat</span>
        {messages.length > 0 && (
          <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.2)' }}>
            {messages.length}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto" style={{ maxHeight: '220px' }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-6 gap-2">
            <span className="text-2xl opacity-20">💬</span>
            <p className="text-xs" style={{ color: 'rgba(220,210,185,0.3)' }}>No messages yet</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.isSent ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 ${msg.isSent ? 'chat-bubble-sent' : 'chat-bubble-recv'}`}>
              <p className="text-xs leading-relaxed">{msg.message}</p>
              <p className="text-[10px] mt-1" style={{ color: msg.isSent ? 'rgba(10,10,15,0.6)' : 'rgba(220,210,185,0.35)' }}>
                {msg.isSent ? formatTime12Hour(msg.time) : msg.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3" style={{ borderTop: '1px solid rgba(201,168,76,0.08)' }}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Send a message..."
            className="flex-1 text-xs px-3 py-2 rounded-xl outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(201,168,76,0.15)',
              color: '#e8e0d0',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'}
          />
          <button type="submit" disabled={!newMessage.trim()}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0"
            style={{
              background: newMessage.trim() ? 'linear-gradient(135deg, #c9a84c, #8b6914)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${newMessage.trim() ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.1)'}`,
              opacity: newMessage.trim() ? 1 : 0.5,
            }}>
            <Send style={{ width: '13px', height: '13px', color: newMessage.trim() ? '#0a0a0f' : 'rgba(220,210,185,0.4)' }} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
