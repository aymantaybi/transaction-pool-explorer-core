import Web3, { Web3BaseProvider } from "web3";
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

export type ExplorerConstructorUrlParameters = { url: string };
export type ExplorerConstructorWeb3Parameters = { web3: Web3 };
export type ExplorerConstructorWebsocketProviderParameters = { websocketProvider: Web3BaseProvider };

export type ExplorerConstructorParameters =
  | ExplorerConstructorUrlParameters
  | ExplorerConstructorWeb3Parameters
  | ExplorerConstructorWebsocketProviderParameters;
