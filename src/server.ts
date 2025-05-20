import { createServer, Server as HttpServer } from "node:http";
import next from "next";
import SocketService from "./lib/socket.ts";

const dev: boolean = process.env.NODE_ENV !== "production";
const hostname: string = "localhost";
const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const httpServer: HttpServer = createServer(handler);
    const socketService = new SocketService();
    socketService.io.attach(httpServer);

    httpServer
      .once("error", (err: Error) => {
        console.error(err);
        process.exit(1);
      })
      .listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
      });

    socketService.initListeners();
  })
  .catch((err: Error) => {
    console.error("Error preparing Next.js app:", err);
    process.exit(1);
  });
