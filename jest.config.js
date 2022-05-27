module.exports = {
  automock: false,
  resetMocks: false,  
  transformIgnorePatterns: [],
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc-node/jest"],
  },
};
