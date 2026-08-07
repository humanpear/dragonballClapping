import { BATTLE_PRELOAD_IMAGE_PATHS } from "./assetPaths";

const preloadPromises = new Map<string, Promise<void>>();
const preloadedImages = new Map<string, HTMLImageElement>();

function preloadImage(src: string): Promise<void> {
  const cachedPromise = preloadPromises.get(src);

  if (cachedPromise) {
    return cachedPromise;
  }

  if (typeof Image === "undefined") {
    return Promise.resolve();
  }

  const image = new Image();
  preloadedImages.set(src, image);

  const promise = new Promise<void>((resolve) => {
    image.onload = () => {
      if (typeof image.decode !== "function") {
        resolve();
        return;
      }

      void image.decode().catch(() => undefined).then(() => resolve());
    };
    image.onerror = () => resolve();
    image.src = src;
  });

  preloadPromises.set(src, promise);
  return promise;
}

export function preloadBattleImages(): Promise<void> {
  return Promise.all(BATTLE_PRELOAD_IMAGE_PATHS.map(preloadImage)).then(() => undefined);
}
