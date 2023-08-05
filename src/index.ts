import Web3, { Web3BaseProvider } from "web3";
import { Web3Subscription } from "web3-core";
import { TransactionsPool } from "./entities";
import EventEmitter from "events";
import { ConfirmedTransactionWithMetadata, ExplorerConstructorParameters, TransactionMetadata, TransactionWithMetadata } from "./interfaces";
import { typeGuards } from "./helpers";

export class Explorer extends EventEmitter {
  websocketProvider: Web3BaseProvider;
  web3: Web3;
  pendingTransactionsPool = new TransactionsPool();
  private currentBlockNumber = BigInt(0);
  private subscriptions: Web3Subscription<{
    error: Error;
    connected: number;
  }>[] = [];

  constructor(parameters: ExplorerConstructorParameters) {
    super();
    if (typeGuards.isExplorerConstructorUrlParameters(parameters)) {
      const { url } = parameters;
      this.websocketProvider = new Web3.providers.WebsocketProvider(url);
      this.web3 = new Web3(this.websocketProvider);
    } else if (typeGuards.isExplorerConstructorWeb3Parameters(parameters)) {
      const { web3 } = parameters;
      if (!web3.provider) throw Error("Provided Web3 instance has no provider.");
      this.websocketProvider = web3.provider;
      this.web3 = web3;
    } else {
      const { websocketProvider } = parameters;
      this.websocketProvider = websocketProvider;
      this.web3 = new Web3(this.websocketProvider);
    }
  }

  async start() {
    if (this.subscriptions.length) return;
    this.currentBlockNumber = await this.web3.eth.getBlockNumber();
    this.subscriptions = await Promise.all([this.subscribeNewBlockHeaders(), this.subscribePendingTransactions()]);
  }

  async stop() {
    await Promise.all(this.subscriptions.map((subscription) => subscription.unsubscribe()));
    this.subscriptions = [];
  }

  private async subscribePendingTransactions() {
    const subscription = await this.web3.eth.subscribe("pendingTransactions");
    subscription.on("data", async (transactionHash) => {
      const timestamp = Date.now();
      const blockNumber = Number(this.currentBlockNumber);
      const transaction = await this.web3.eth.getTransaction(transactionHash);
      const addedTransaction = this.pendingTransactionsPool.addTransaction(transaction, { timestamp, blockNumber });
      this.emit("transactionAdded", addedTransaction);
      if (!addedTransaction.metadata.original) return;
      this.emit("transactionReplaced", addedTransaction);
    });
    return subscription;
  }

  private async subscribeNewBlockHeaders() {
    const subscription = await this.web3.eth.subscribe("newBlockHeaders");
    subscription.on("data", async (blockHeader) => {
      this.currentBlockNumber = BigInt(blockHeader.number || this.currentBlockNumber);
      const block = await this.web3.eth.getBlock(blockHeader.number, true);
      const confirmedTransactions = this.pendingTransactionsPool.removeConfirmedTransactions(block);
      if (!confirmedTransactions.length) return;
      this.emit("transactionsConfirmed", confirmedTransactions);
    });
    return subscription;
  }
}

export declare interface Explorer {
  on(event: "transactionAdded", listener: (data: TransactionWithMetadata) => void): this;
  on(event: "transactionReplaced", listener: (data: TransactionWithMetadata) => void): this;
  on(event: "transactionsConfirmed", listener: (data: ConfirmedTransactionWithMetadata[]) => void): this;
  emit(eventName: "transactionAdded", data: TransactionWithMetadata): boolean;
  emit(eventName: "transactionReplaced", data: TransactionWithMetadata): boolean;
  emit(eventName: "transactionsConfirmed", data: ConfirmedTransactionWithMetadata[]): boolean;
}
