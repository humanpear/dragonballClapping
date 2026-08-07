import { createServerApp, handleWsUpgrade } from "./app.js";

const DEFAULT_PORT = 8787;

const configuredPort = process.env.PORT ? Number(process.env.PORT) : DEFAULT_PORT;
const port = Number.isFinite(configuredPort) ? configuredPort : DEFAULT_PORT;

const { httpServer, wsServer } = createServerApp();

httpServer.on("upgrade", (req, socket, head) => {
  handleWsUpgrade(wsServer, req, socket, head);
});

httpServer.listen(port, () => {
  // Keep startup logs deterministic for future smoke assertions.
  console.log(`[server] listening on http://localhost:${port}`);
});
