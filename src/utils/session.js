// utils/session.js
export const setSession = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const getSession = (key) => {
  const value = sessionStorage.getItem(key);
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const clearGameSession = () => {
  const keys = ['gameId', 'fen', 'moves', 'status', 'currentPlayer', 'gameStarted'];
  keys.forEach(key => sessionStorage.removeItem(key));
};
