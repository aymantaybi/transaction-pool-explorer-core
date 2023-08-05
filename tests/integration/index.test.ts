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
      const { hash, from, nonce } = data;
      const transaction = explorer.pendingTransactionsPool.getTransaction(from, nonce);
      expect(transaction?.hash).toBe(hash);
      done();
    });
  }, 60000);
  test("Listen To Confirmed Transactions", (done) => {
    explorer.on("transactionsConfirmed", (data) => {
      for (const transaction of data) {
        const { from, nonce, metadata } = transaction;
        expect(metadata.submittedAt).toBeDefined();
        expect(metadata.confirmedAt).toBeDefined();
        expect(explorer.pendingTransactionsPool.getTransaction(from, nonce)).toBeUndefined();
      }
      done();
    });
  }, 60000);
});
