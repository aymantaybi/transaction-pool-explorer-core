import EventEmitter from "events";
import Web3, { FMT_BYTES, FMT_NUMBER, TransactionReceipt } from "web3";
import { Web3PromiEvent } from "web3-core";
import { SendTransactionEvents } from "web3/lib/commonjs/eth.exports";

export function waitForEvent<T>(eventEmitter: EventEmitter, eventName: string, condition: (data: T) => boolean, timeout: number) {
  return new Promise<T | undefined>((resolve) => {
    let timeoutId: string | number | NodeJS.Timeout | undefined;
    const onEvent = (value: T) => {
      if (condition(value)) {
        clearTimeout(timeoutId);
        eventEmitter.off(eventName, onEvent);
        resolve(value);
      }
    };
    const onTimeout = () => {
      eventEmitter.off(eventName, onEvent);
      resolve(undefined);
    };
    timeoutId = setTimeout(onTimeout, timeout);
    eventEmitter.on(eventName, onEvent);
  });
}

export function sendVoidTransaction(web3: Web3, nonce: bigint, gasPrice = web3.utils.toWei(1, "Gwei")) {
  const from = web3.eth.accounts.wallet[0].address;
  const to = from;
  const value = 0;
  const gasLimit = 100000;
  const transactionData = {
    from,
    to,
    value,
    nonce,
    gasPrice,
    gasLimit,
  };
  const transaction = web3.eth.sendTransaction(transactionData);
  return transaction;
}

export async function safeWaitForTransactions(
  transactions: Web3PromiEvent<
    TransactionReceipt,
    SendTransactionEvents<{
      readonly number: FMT_NUMBER.BIGINT;
      readonly bytes: FMT_BYTES.HEX;
    }>
  >[]
) {
  try {
    await Promise.all(transactions);
  } catch (error) {}
}
