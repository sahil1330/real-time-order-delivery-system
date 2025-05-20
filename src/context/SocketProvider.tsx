/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { createContext, useCallback, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
interface SocketProviderProps {
  children?: React.ReactNode;
}

interface ISocketContext {
  sendMessage: (message: string) => any;
  joinRoom: (room: string) => any;
  leaveRoom: (room: string) => any;
  socket?: typeof Socket;
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
  const [socket, setSocket] = useState<typeof Socket>();

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
      console.log("Joining room", room);
      console.log("Socket in provider", socket);
      if (socket) {
        socket.emit("join-room", room);
      }
    },
    [socket]
  );

  const leaveRoom: ISocketContext["leaveRoom"] = useCallback(
    (room) => {
      console.log("Leaving room", room);
      if (socket) {
        socket.emit("leave-room", room);
      }
    },
    [socket]
  );

  const sendMessageOrderAccepted: ISocketContext["sendMessageOrderAccepted"] =
    useCallback(
      (order) => {
        console.log("Sending order accepted message", order);
        if (socket) {
          socket.emit("order-accepted", { order });
        }
      },
      [socket]
    );

  const sendMessageOrderUpdate: ISocketContext["sendMessageOrderUpdate"] =
    useCallback(
      (order) => {
        console.log(
          "Sending order update message",
          order,
          "\nSocket for update: ",
          socket
        );
        if (socket) {
          socket.emit("update-order", { order });
        }
      },
      [socket]
    );

  useEffect(() => {
    const _socket = io();
    setSocket(_socket);
    _socket.on("connect", () => {
      console.log("Socket connected");
    });

    return () => {
      _socket.disconnect();
      setSocket(undefined);
      console.log("Socket disconnected");
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
