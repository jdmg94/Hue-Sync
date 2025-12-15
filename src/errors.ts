export class HueBridgeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HueBridgeError";
    Object.setPrototypeOf(this, HueBridgeError.prototype);
  }
}

export class HueBridgeNetworkError extends HueBridgeError {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "HueBridgeNetworkError";
    Object.setPrototypeOf(this, HueBridgeNetworkError.prototype);
  }
}

export class HueBridgeAuthError extends HueBridgeError {
  constructor(message: string) {
    super(message);
    this.name = "HueBridgeAuthError";
    Object.setPrototypeOf(this, HueBridgeAuthError.prototype);
  }
}

export class HueBridgeStreamError extends HueBridgeError {
  constructor(message: string) {
    super(message);
    this.name = "HueBridgeStreamError";
    Object.setPrototypeOf(this, HueBridgeStreamError.prototype);
  }
}

export class HueBridgeApiError extends HueBridgeError {
  constructor(
    message: string,
    public readonly errors: Error[]
  ) {
    super(message);
    this.name = "HueBridgeApiError";
    Object.setPrototypeOf(this, HueBridgeApiError.prototype);
  }
}

export class HueBridgeDiscoveryError extends HueBridgeError {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "HueBridgeDiscoveryError";
    Object.setPrototypeOf(this, HueBridgeDiscoveryError.prototype);
  }
}
