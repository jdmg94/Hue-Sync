export const dtls = {
  createSocket: jest.fn(() => ({
    close: jest.fn(),
    send: jest.fn(),
  })),
};
