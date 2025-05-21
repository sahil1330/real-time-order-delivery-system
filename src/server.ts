import { createServer, Server as HttpServer } from "node:http";
import next from "next";
import SocketService from "./lib/socket.ts";
import { availableParallelism } from "node:os";
import cluster from "node:cluster";
import { setupPrimary } from "@socket.io/cluster-adapter";
const dev: boolean = process.env.NODE_ENV !== "production";
const hostname: string = "localhost";
const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

if (cluster.isPrimary) {
  const numCPUs = availableParallelism();
  // create one worker per available core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({
      PORT: port + i,
    });
  }

  // set up the adapter on the primary thread
  setupPrimary();
} else {
  app
    .prepare()
    .then(() => {
      const httpServer: HttpServer = createServer(handler);
      const socketService = new SocketService();
      socketService.io.attach(httpServer);

      // each worker will listen on a distinct port
      const port: number = process.env.PORT
        ? parseInt(process.env.PORT, 10)
        : 3000;

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
}
