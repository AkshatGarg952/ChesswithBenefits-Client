import { MessageCircle, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import socket from "../socket/SocketConnection.jsx";

const Chat = ({ className = "", messages, onSendMessage, roomId }) => {
  console.log(roomId);
  const [newMessage, setNewMessage] = useState('');
  
  useEffect(() => {
  console.log("I AM LISTENING!");
  

  const handleReceiveMessage = (serverMessage) => {
    console.log("Receiving the message!");
    console.log(serverMessage);
    const incomingMsg = {
      id:Date.now(),
      message: serverMessage.message,
      isSent: false,
      time: new Date(serverMessage.time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    onSendMessage(incomingMsg);
  };

  socket.on("ReceiveMessage", handleReceiveMessage);

  return () => {
    socket.off("ReceiveMessage", handleReceiveMessage);
  };
}, []);


function formatTime12Hour(isoTime) {
  return new Date(isoTime).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}



  const handleSendMessage = (e) => {  
    e.preventDefault();
  console.log("Sending message with roomId:", roomId);
    if (newMessage.trim()) {
      socket.emit("SendMessage", {
  message: newMessage,
  roomId: roomId,
});
      
      const localMsg = {
        id:Date.now(),
        message:newMessage,
        isSent: true,
        time: new Date().toISOString()
      };
      

      onSendMessage(localMsg);
      // console.log(messages);
      setNewMessage('');
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-md border border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-2 p-4 border-b border-gray-100">
        <MessageCircle className="w-5 h-5 text-orange-600" />
        <h3 className="font-semibold text-gray-800">Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-64">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isSent ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-2xl ${
              message.isSent 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="text-sm">{message.message}</p>
              <p className={`text-xs mt-1 ${
                message.isSent ? 'text-orange-100' : 'text-gray-500'
              }`}>
                {message.isSent? (
                  <span>{formatTime12Hour(message.time)}</span>
                ) : (<span>{message.time}</span>)}
                
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 min-w-0 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 shrink-0"
            disabled={!newMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
