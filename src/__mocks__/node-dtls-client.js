export const dtls = {
  createSocket: jest.fn(() => ({
    close: jest.fn(),
    send: jest.fn(),
    on: jest.fn((event, callback) => {
      if (event === "connected") callback();
    }),
  })),
};
