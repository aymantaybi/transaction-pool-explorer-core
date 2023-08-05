import EventEmitter from "events";
import Web3 from "web3";

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
  return web3.eth.sendTransaction(transactionData);
}
