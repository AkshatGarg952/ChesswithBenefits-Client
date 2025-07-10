const ChatStorage = {
  get(roomId, userId) {
    return JSON.parse(localStorage.getItem(`chat_${roomId}_${userId}`)) || [];
  },
  add(roomId, userId, message) {
    const messages = ChatStorage.get(roomId, userId);
    messages.push(message);
    localStorage.setItem(`chat_${roomId}_${userId}`, JSON.stringify(messages));
  },
  clear(roomId, userId) {
    localStorage.removeItem(`chat_${roomId}_${userId}`);
  }
};

export default ChatStorage;
