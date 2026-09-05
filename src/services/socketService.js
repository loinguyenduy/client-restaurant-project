import { io } from "socket.io-client";
import { socketUrl } from "../config/runtimeConfig.js";

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
