export const dtls = {
  createSocket: jest.fn(() => ({
    send: jest.fn(),
    on: jest.fn((event, callback) => {
      if (event === "connected" || event === "close") callback();
    }),
  })),
};
