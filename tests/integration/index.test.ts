import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import { Explorer } from "../../src/";

const { WEBSOCKET_RPC_ENDPOINT } = process.env;

if (!WEBSOCKET_RPC_ENDPOINT || !WEBSOCKET_RPC_ENDPOINT.startsWith("ws")) throw Error("WEBSOCKET_RPC_ENDPOINT env variable should start with ws");

const url = WEBSOCKET_RPC_ENDPOINT;

const explorer = new Explorer({ url });

describe("Integration Test", () => {
  beforeAll(async () => {
    await explorer.start();
  });
  afterAll(async () => {
    await explorer.stop();
    explorer.websocketProvider.disconnect();
  });
  test("Listen To Added Transactions", (done) => {
    explorer.on("transactionAdded", (data) => {
      expect(data).toHaveProperty("metadata");
      done();
    });
  }, 60000);
});
