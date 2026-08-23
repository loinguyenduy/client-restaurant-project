import { io } from "socket.io-client";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080/api/v1";
const socketUrl = process.env.REACT_APP_SOCKET_URL || apiUrl.replace(/\/api\/v1\/?$/, "");
let socket;
let currentToken = null;

const getSocket = () => {
  if (!socket) {
    socket = io(socketUrl, {
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};

const connectSocket = (accessToken = "") => {
  const instance = getSocket();
  const nextToken = accessToken || "";
  if (currentToken !== nextToken && instance.connected) instance.disconnect();
  currentToken = nextToken;
  instance.auth = nextToken ? { token: nextToken } : {};
  if (!instance.connected) instance.connect();
  return instance;
};

const disconnectSocket = () => {
  if (socket) socket.disconnect();
};

export { connectSocket, disconnectSocket, getSocket };
