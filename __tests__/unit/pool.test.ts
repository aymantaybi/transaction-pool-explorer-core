import { describe, expect, it } from "@jest/globals";
import { TransactionsPool } from "../../src/pool";
import { transaction, transactionsTree, block } from "../__fixtures__/pool";

const transactionsPool = new TransactionsPool(transactionsTree);

describe("Transactions Pool Test", () => {
  it("Should Add A Transaction", () => {
    const submittedAt = 1691199964973;
    const addedTransaction = transactionsPool.addTransaction(transaction, submittedAt);
    expect(addedTransaction).toBeDefined();
    expect(addedTransaction.metadata.submittedAt).toBe(submittedAt);
  });
  it("Should Get A Transaction By Sender Address And Nonce", () => {
    const transactionInPool = transactionsPool.getTransaction(transaction.from, transaction.nonce);
    expect(transactionInPool).toBeDefined();
  });
  it("Should Remove Confirmed Transactions", () => {
    const confirmedTransactions = transactionsPool.removeConfirmedTransactions(block);
    expect(confirmedTransactions).toBeDefined();
    expect(confirmedTransactions.length).toBe(1);
    expect(confirmedTransactions[0].metadata.confirmedAt).toBe(Number(block.timestamp) * 1000);
  });
});
