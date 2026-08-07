import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders start screen shell", () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('aria-label="start-game"');
    expect(html).toContain("Dragonball Clapping title");
  });
});
