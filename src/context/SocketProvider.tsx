/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
interface SocketProviderProps {
  children?: React.ReactNode;
}

interface ISocketContext {
  sendMessage: (message: string) => any;
  joinRoom: (room: string) => any;
  leaveRoom: (room: string) => any;
  socket?: Socket;
  sendMessageOrderAccepted: (order: string) => any;
  sendMessageOrderUpdate: (order: string) => any;
}

export const useSocket = () => {
  const state = React.useContext(SocketContext);
  if (!state) {
    throw new Error("State is undefined");
  }
  return state;
};

const SocketContext = createContext<ISocketContext | null>(null);

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);

  const sendMessage: ISocketContext["sendMessage"] = useCallback(
    (msg) => {
      if (socket) {
        socket.emit("event:message", { message: msg });
      }
    },
    [socket]
  );

  const joinRoom: ISocketContext["joinRoom"] = useCallback(
    (room) => {
      if (socket) {
        socket.emit("join-room", room);
      }
    },
    [socket]
  );

  const leaveRoom: ISocketContext["leaveRoom"] = useCallback(
    (room) => {
      if (socket) {
        socket.emit("leave-room", room);
      }
    },
    [socket]
  );

  const sendMessageOrderAccepted: ISocketContext["sendMessageOrderAccepted"] =
    useCallback(
      (order) => {
        if (socket) {
          socket.emit("order-accepted", { order });
        }
      },
      [socket]
    );

  const sendMessageOrderUpdate: ISocketContext["sendMessageOrderUpdate"] =
    useCallback(
      (order) => {
        if (socket) {
          socket.emit("update-order", { order });
        }
      },
      [socket]
    );

  useEffect(() => {
    const _socket = io("", {
      transports: ["websocket"],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });
    setSocket(_socket);
    _socket.on("connect", () => {});

    return () => {
      _socket.disconnect();
      setSocket(undefined);
    };
  }, []);
  return (
    <SocketContext.Provider
      value={
        {
          sendMessage,
          joinRoom,
          leaveRoom,
          socket,
          sendMessageOrderAccepted,
          sendMessageOrderUpdate,
        } as ISocketContext
      }
    >
      {children}
    </SocketContext.Provider>
  );
};
