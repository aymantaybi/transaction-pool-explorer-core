import Web3 from "web3";
import { ExplorerConstructorParameters, ExplorerConstructorUrlParameters, ExplorerConstructorWeb3Parameters } from "../../interfaces";

export function isExplorerConstructorUrlParameters(parameters: ExplorerConstructorParameters): parameters is ExplorerConstructorUrlParameters {
  return typeof (parameters as ExplorerConstructorUrlParameters).url === "string";
}

export function isExplorerConstructorWeb3Parameters(parameters: ExplorerConstructorParameters): parameters is ExplorerConstructorWeb3Parameters {
  return (parameters as ExplorerConstructorWeb3Parameters).web3 instanceof Web3;
}
