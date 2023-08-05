import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import { Explorer } from "../../src";
import Web3 from "web3";
import { sendVoidTransaction, waitForEvent } from "../__utils__";
import { TransactionWithMetadata } from "../../src/interfaces";

const { WEBSOCKET_RPC_ENDPOINT, PRIVATE_KEY } = process.env;

if (!WEBSOCKET_RPC_ENDPOINT || !WEBSOCKET_RPC_ENDPOINT.startsWith("ws")) throw Error('WEBSOCKET_RPC_ENDPOINT Env Variable Should Start With "ws"');
if (!PRIVATE_KEY) throw Error("Missing PRIVATE_KEY Env Variable");

const url = WEBSOCKET_RPC_ENDPOINT;

const web3 = new Web3(new Web3.providers.WebsocketProvider(url));

web3.eth.accounts.wallet.add(PRIVATE_KEY);

const explorer = new Explorer({ web3 });

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
  test("Listen To Replaced Transactions", async () => {
    const { address } = web3.eth.accounts.wallet[0];
    const nonce = await web3.eth.getTransactionCount(address);
    sendVoidTransaction(web3, nonce);
    const originalTransaction = await waitForEvent<TransactionWithMetadata>(
      explorer,
      "transactionAdded",
      (data) => data.from.toLowerCase() === address.toLowerCase(),
      10000
    );
    sendVoidTransaction(web3, nonce, web3.utils.toWei(5, "Gwei"));
    const replacementTransaction = await waitForEvent<TransactionWithMetadata>(
      explorer,
      "transactionReplaced",
      (data) => data.from.toLowerCase() === address.toLowerCase(),
      10000
    );
    expect(originalTransaction).toBeDefined();
    expect(replacementTransaction).toBeDefined();
    expect(replacementTransaction?.metadata.original).toEqual(originalTransaction);
  }, 60000);
});
