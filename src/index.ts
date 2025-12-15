// Common types
export * from "./common/types";

// Resource types and utilities
export * from "./resources/types";
export * from "./resources/endpoints";

// Bridge types and functionality
export * from "./bridge/types";
export { discover, register } from "./bridge/discovery";
export { HueBridge } from "./bridge/bridge";

// Streaming types
export * from "./streaming/types";

// Errors
export * from "./errors";

// Constants
export * from "./constants";

// Default export for backward compatibility
export { HueBridge as default } from "./bridge/bridge";
