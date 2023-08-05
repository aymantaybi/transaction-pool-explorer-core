/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["dotenv/config"],
  modulePathIgnorePatterns: ["__fixtures__", "__utils__"],
  testTimeout: 60000,
};
