/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from "socket.io";
class SocketService {
  private _io: Server;
  constructor() {
    this._io = new Server();
  }

  public initListeners() {
    const io = this.io;
    io.on("connect", (socket) => {
      socket.on("join-room", (room: string) => {
        socket.join(room);
      });
      socket.on("leave-room", (room: string) => {
        socket.leave(room);
      });

      socket.on("new-order", async (order: any) => {
        io.to("admin").emit("new-order", order);
        io.to("delivery").emit("new-unassigned-order", order);
      });

      socket.on("order-accepted", async (order: any) => {
        io.to(`order-${order.order._id}`)
          .to("admin")
          .emit("order-status-update", order);
        // Notify admin room
        io.to("admin").emit("order-accepted", {
          orderId: order.order._id,
          deliveryPerson: order.order.deliveryPerson,
        });
      });

      socket.on("update-order", async (order: any) => {
        // Notify customer room
        io.to(`order-${order.order._id}`).emit("order-status-update", order);
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
