import { once } from "node:events";
import { afterEach, describe, expect, it } from "vitest";
import { createServerApp } from "./app.js";

interface RunningApp {
  baseUrl: string;
  stop: () => Promise<void>;
}

async function bootApp(): Promise<RunningApp> {
  const { httpServer, wsServer } = createServerApp();
  httpServer.listen(0);
  await once(httpServer, "listening");

  const address = httpServer.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to resolve test server address");
  }

  const stop = async (): Promise<void> => {
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        wsServer.close((err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      }),
      new Promise<void>((resolve, reject) => {
        httpServer.close((err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      })
    ]);
  };

  return { baseUrl: `http://127.0.0.1:${address.port}`, stop };
}

let runningApp: RunningApp | null = null;

afterEach(async () => {
  if (runningApp) {
    await runningApp.stop();
    runningApp = null;
  }
});

describe("server app", () => {
  it("exposes a health endpoint", async () => {
    runningApp = await bootApp();

    const response = await fetch(`${runningApp.baseUrl}/health`);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("returns not found on unknown route", async () => {
    runningApp = await bootApp();

    const response = await fetch(`${runningApp.baseUrl}/unknown`);
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      message: "Not Found"
    });
  });
});
