import { Web3Eth } from "web3-eth/src/web3_eth";

export type Transaction = Awaited<ReturnType<Web3Eth["getTransaction"]>>;

export interface TransactionMetadata {
  submittedAt: number;
  confirmedAt?: number;
  original?: TransactionWithMetadata;
}

export type TransactionWithMetadata = Transaction & { metadata: TransactionMetadata };

export interface TransactionsTree {
  [address: string]: {
    [nonce: string]: TransactionWithMetadata;
  };
}

export type Block = Awaited<ReturnType<Web3Eth["getBlock"]>>;
