import { SorobanRpc, xdr } from 'stellar-sdk';
import { SorobanResponse } from './index.js';
import { ContractError, ContractErrorType, parseError } from './contract_error.js';

export class Resources {
  fee: number;
  refundableFee: number;
  cpuInst: number;
  readBytes: number;
  writeBytes: number;
  readOnlyEntries: number;
  readWriteEntries: number;

  constructor(
    fee: number,
    refundableFee: number,
    cpuInst: number,
    readBytes: number,
    writeBytes: number,
    readOnlyEntries: number,
    readWriteEntries: number
  ) {
    this.fee = fee;
    this.refundableFee = refundableFee;
    this.cpuInst = cpuInst;
    this.readBytes = readBytes;
    this.writeBytes = writeBytes;
    this.readOnlyEntries = readOnlyEntries;
    this.readWriteEntries = readWriteEntries;
  }

  /**
   * Builds a Resources object from TransactionEnvelope
   * @returns - Resources
   */
  static fromTransaction(tx: xdr.TransactionEnvelope | string): Resources {
    if (typeof tx === 'string') {
      tx = xdr.TransactionEnvelope.fromXDR(tx, 'base64');
    }
    const transaction = tx.v1().tx();
    const data = transaction.ext().sorobanData();
    const sorobanResources = data.resources();
    const footprint = sorobanResources.footprint();

    const fee = transaction.fee();
    const refundableFee = Number(data.resourceFee().toString());
    const cpuInst = sorobanResources.instructions();
    const readBytes = sorobanResources.readBytes();
    const writeBytes = sorobanResources.writeBytes();
    const readOnlyEntries = footprint.readOnly().length;
    const readWriteEntries = footprint.readWrite().length;

    return new Resources(
      fee,
      refundableFee,
      cpuInst,
      readBytes,
      writeBytes,
      readOnlyEntries,
      readWriteEntries
    );
  }
}

export class ContractResult<T> {
  ok: boolean;
  hash: string;
  resources: Resources;
  value?: T;
  error?: ContractError;

  constructor(ok: boolean, hash: string, resources: Resources, value?: T, error?: ContractError) {
    this.hash = hash;
    this.resources = resources;
    this.ok = ok;
    this.value = value;
    this.error = error;
  }

  /**
   * Create an Error ContractResult.
   * @param hash - The hash of the transaction.
   * @param resources - The resources used by the transaction.
   * @param error - The error
   * @returns - Contract Result
   */
  static error<T>(hash: string, resources: Resources, error: ContractError): ContractResult<T> {
    return new ContractResult(false, hash, resources, undefined, error);
  }

  /**
   * Create a Successful ContractResult.
   * @param hash - The hash of the transaction.
   * @param resources - The resources used by the transaction.
   * @param value - The return value, if any.
   * @returns - Contract Result
   */
  static success<T>(hash: string, resources: Resources, value?: T): ContractResult<T> {
    return new ContractResult(true, hash, resources, value, undefined);
  }

  /**
   * Create a ContractResult from a SorobanResponse.
   *
   * @param tx - The Transaction that was sent.
   * @param response - The Soroban RPC response.
   * @param parse - The XDR parsing function to unwrap the result.
   * @returns - A ContractResult containing the result of the response.
   */
  static fromResponse<T>(
    hash: string,
    resources: Resources,
    response: SorobanResponse,
    parse: (value: string | undefined) => T | undefined
  ): ContractResult<T> {
    // response is a SimulateTransactionResponse
    if ('id' in response) {
      const simulated = response as SorobanRpc.Api.SimulateTransactionResponse;
      if (SorobanRpc.Api.isSimulationSuccess(simulated)) {
        const xdr_str = simulated.result?.retval.toXDR('base64');
        return ContractResult.success<T>(hash, resources, parse(xdr_str));
      } else if (SorobanRpc.Api.isSimulationRestore(simulated)) {
        return ContractResult.error(
          hash,
          resources,
          new ContractError(
            ContractErrorType.InvokeHostFunctionEntryArchived,
            JSON.stringify(simulated.restorePreamble.transactionData.getFootprint(), null, 2)
          )
        );
      } else if (SorobanRpc.Api.isSimulationError(simulated)) {
        return ContractResult.error(hash, resources, parseError(simulated));
      } else {
        return ContractResult.error(
          hash,
          resources,
          new ContractError(
            ContractErrorType.UnknownError,
            `invalid simulation: no result in ${simulated}`
          )
        );
      }
    }

    // response is a GetTransactionResponse
    if ('resultXdr' in response) {
      // if `sendTx` awaited the inclusion of the tx in the ledger, it used
      // `getTransaction`, which has a `resultXdr` field
      const getResult = response as SorobanRpc.Api.GetTransactionResponse;
      if (getResult.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
        const xdr_str = getResult.returnValue?.toXDR('base64');
        return ContractResult.success<T>(hash, resources, parse(xdr_str));
      } else {
        const getResult = response as SorobanRpc.Api.GetFailedTransactionResponse;
        return ContractResult.error(hash, resources, parseError(getResult.resultXdr));
      }
    }

    // otherwise, it returned the result of `sendTransaction`
    if ('errorResult' in response) {
      const sendResult = response as SorobanRpc.Api.SendTransactionResponse;
      return ContractResult.error(hash, resources, parseError(sendResult.errorResult));
    }

    // if neither of these are present, something went wrong
    return ContractResult.error(
      hash,
      resources,
      new ContractError(ContractErrorType.UnknownError, JSON.stringify(response, null, 2))
    );
  }

  /**
   * Unwrap a successful result, or throw an error.
   *
   * @returns The value of the result.
   */
  unwrap(): T {
    if (this.ok) {
      return this.value;
    } else if (this.error !== undefined) {
      throw this.error;
    } else {
      throw new Error('unable to unwrap ContractResult');
    }
  }

  toString(): string {
    if (this.ok) {
      if (this.value === undefined) {
        return 'Success!';
      } else {
        return `Success: ${this.value.toString()}`;
      }
    } else {
      if (this.error === undefined) {
        return 'Failure: Unknown Error Occurred';
      } else {
        return `Failure: ${this.error.toString()}`;
      }
    }
  }
}
