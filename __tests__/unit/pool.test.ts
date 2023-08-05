import { describe, expect, it } from "@jest/globals";
import { TransactionsPool } from "../../src/entities";
import { transaction, transactionsTree, block } from "../__fixtures__/pool";

const transactionsPool = new TransactionsPool(transactionsTree);

describe("Transactions Pool Test", () => {
  it("Should Add A Transaction", () => {
    const timestamp = 1691199964973;
    const blockNumber = 38648852;
    const addedTransaction = transactionsPool.addTransaction(transaction, { timestamp, blockNumber });
    expect(addedTransaction).toBeDefined();
    expect(addedTransaction.metadata.submittedAt.timestamp).toBe(timestamp);
    expect(addedTransaction.metadata.submittedAt.blockNumber).toBe(blockNumber);
  });
  it("Should Get A Transaction By Sender Address And Nonce", () => {
    const transactionInPool = transactionsPool.getTransaction(transaction.from, transaction.nonce);
    expect(transactionInPool).toBeDefined();
  });
  it("Should Remove Confirmed Transactions", () => {
    const confirmedTransactions = transactionsPool.removeConfirmedTransactions(block);
    expect(confirmedTransactions).toBeDefined();
    expect(confirmedTransactions.length).toBe(1);
    expect(confirmedTransactions[0].metadata.confirmedAt.timestamp).toBe(Number(block.timestamp) * 1000);
    expect(confirmedTransactions[0].metadata.confirmedAt.blockNumber).toBe(Number(block.number));
  });
});
