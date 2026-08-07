import { createServer, type IncomingMessage, type Server as HttpServer } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer } from "ws";

export interface ServerApp {
  httpServer: HttpServer;
  wsServer: WebSocketServer;
}

export function createServerApp(): ServerApp {
  const httpServer = createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: false, message: "Not Found" }));
  });

  const wsServer = new WebSocketServer({ noServer: true });
  wsServer.on("connection", (socket) => {
    socket.send(
      JSON.stringify({
        type: "server_ready",
        message: "Dragonball Clapping server shell is running."
      })
    );
  });

  return { httpServer, wsServer };
}

export function handleWsUpgrade(
  wsServer: WebSocketServer,
  req: IncomingMessage,
  socket: Duplex,
  head: Buffer
): void {
  wsServer.handleUpgrade(req, socket, head, (wsSocket) => {
    wsServer.emit("connection", wsSocket, req);
  });
}
