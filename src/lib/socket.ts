/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from "socket.io";
class SocketService {
  private _io: Server;
  constructor() {
    console.log("* SocketService initialized");
    this._io = new Server();
  }

  public initListeners() {
    const io = this.io;
    console.log("* SocketService listeners initialized...");
    io.on("connect", (socket) => {
      console.log(`New socket connected: ${socket.id}`);
      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log(`Message received: ${message}`);
      });

      socket.on("join-room", (room: string) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined ${room}`);
      });
      socket.on("leave-room", (room: string) => {
        socket.leave(room);
        console.log(`Socket ${socket.id} left ${room}`);
      });

      socket.on("new-order", async (order: any) => {
        io.to("admin").emit("new-order", order);
        console.log(`New order event emitted to admin room: ${order}`);
        io.to("delivery").emit("new-unassigned-order", order);
        console.log(
          `New unassigned order event emitted to delivery room: ${order}`
        );
      });

      socket.on("order-accepted", async (order: any) => {
        // Notify customer room
        io.to(`order-${order._id}`).emit("order-status-update", order);
        // Notify admin room
        io.to("admin").emit("order-accepted", {
          orderId: order._id,
          deliveryPerson: order.deliveryPerson,
        });
      });

      socket.on("update-order", async (order: any) => {
        socket.join(`order-${order._id}`);
        console.log(
          `Socket ${socket.id} joined order room: order-${order._id}`
        );
        // Notify customer room
        console.log(
          "Order status update event emitted to customer room:",
          order
        );
        io.to(`order-${order._id}`).emit("order-status-update", order);
        // Notify admin room
        io.to("admin").emit("order-status-update", order);
      });
    });
  }

  public get io(): Server {
    return this._io;
  }
}

export default SocketService;
