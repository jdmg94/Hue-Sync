if (!globalThis.fetch) {
  require("cross-fetch/polyfill");
}

export * from "./hue.types";
export { default } from "./hue";
