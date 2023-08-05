import { Block, TemporalReference, Transaction, TransactionMetadata, TransactionWithMetadata, TransactionsTree } from "../interfaces";

export class TransactionsPool {
  private transactionsTree: TransactionsTree;

  constructor(transactionsTree: TransactionsTree = {}) {
    this.transactionsTree = transactionsTree;
  }

  addTransaction(transaction: Transaction, temporalReference: TemporalReference): TransactionWithMetadata {
    const { from, nonce } = transaction;
    this.transactionsTree[from] = this.transactionsTree[from] || {};
    const original = this.transactionsTree[from][nonce];
    this.transactionsTree[from][nonce] = { ...transaction, metadata: { submittedAt: temporalReference, original } };
    return this.transactionsTree[from][nonce];
  }

  removeTransaction(address: string, nonce: string): TransactionWithMetadata | undefined {
    const transaction = this.getTransaction(address, nonce);
    if (!transaction) return;
    delete this.transactionsTree[address][nonce];
    return transaction;
  }

  getTransaction(address: string, nonce: string): TransactionWithMetadata | undefined {
    return this.transactionsTree[address]?.[nonce];
  }

  removeConfirmedTransactions(block: Block) {
    const confirmedTransactions: Array<TransactionWithMetadata & { metadata: TransactionMetadata & { confirmedAt: TemporalReference } }> = [];
    const timestamp = Number(block.timestamp) * 1000;
    const blockNumber = Number(block.number);
    for (const transaction of block.transactions) {
      if (typeof transaction === "string") continue;
      const { from, nonce } = transaction;
      const removedTransaction = this.removeTransaction(from, String(nonce));
      if (removedTransaction) {
        const confirmedTransaction = {
          ...removedTransaction,
          metadata: { ...removedTransaction.metadata, confirmedAt: { timestamp, blockNumber } },
        };
        confirmedTransactions.push(confirmedTransaction);
      }
    }
    return confirmedTransactions;
  }
}
