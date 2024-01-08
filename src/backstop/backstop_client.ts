import { Address, Contract, ContractSpec, xdr } from 'stellar-sdk';
import { ContractResult, Network, TxOptions, i128 } from '../index.js';
import { invokeOperation } from '../tx.js';
import { Q4W } from './index.js';

// @dev ENCODING REQUIRES PROPERTY NAMES TO MATCH RUST NAMES

export interface BackstopInitializeArgs {
  backstop_token: Address | string;
  emitter: Address | string;
  usdc_token: Address | string;
  blnd_token: Address | string;
  pool_factory: Address | string;
  drop_list: Map<Address | string, i128>;
}

export interface PoolBackstopActionArgs {
  from: Address | string;
  pool_address: Address | string;
  amount: i128;
}

export interface AddRewardArgs {
  to_add: Address | string;
  to_remove: Address | string;
}

export interface BackstopClaimArgs {
  from: Address | string;
  pool_addresses: Array<Address | string>;
  to: Address | string;
}

export interface DrawArgs {
  from: Address | string;
  pool_address: Address | string;
  amount: i128;
}

export class BackstopClient {
  address: string;
  private contract: Contract;
  spec: ContractSpec;

  constructor(address: string) {
    this.address = address;
    this.contract = new Contract(address);
    // @dev: Generated from soroban-cli Typescript bindings
    this.spec = new ContractSpec([
      'AAAAAQAAABhUaGUgcG9vbCdzIGJhY2tzdG9wIGRhdGEAAAAAAAAAEFBvb2xCYWNrc3RvcERhdGEAAAAEAAAAAAAAAARibG5kAAAACwAAAAAAAAAHcTR3X3BjdAAAAAALAAAAAAAAAAZ0b2tlbnMAAAAAAAsAAAAAAAAABHVzZGMAAAAL',
      'AAAAAQAAABxUaGUgcG9vbCdzIGJhY2tzdG9wIGJhbGFuY2VzAAAAAAAAAAtQb29sQmFsYW5jZQAAAAADAAAAAAAAAANxNHcAAAAACwAAAAAAAAAGc2hhcmVzAAAAAAALAAAAAAAAAAZ0b2tlbnMAAAAAAAs=',
      'AAAAAQAAACdBIGRlcG9zaXQgdGhhdCBpcyBxdWV1ZWQgZm9yIHdpdGhkcmF3YWwAAAAAAAAAAANRNFcAAAAAAgAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAANleHAAAAAABg==',
      'AAAAAQAAACdBIGRlcG9zaXQgdGhhdCBpcyBxdWV1ZWQgZm9yIHdpdGhkcmF3YWwAAAAAAAAAAAtVc2VyQmFsYW5jZQAAAAACAAAAAAAAAANxNHcAAAAD6gAAB9AAAAADUTRXAAAAAAAAAAAGc2hhcmVzAAAAAAAL',
      'AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABgAAAAAAAAAOYmFja3N0b3BfdG9rZW4AAAAAABMAAAAAAAAAB2VtaXR0ZXIAAAAAEwAAAAAAAAAKdXNkY190b2tlbgAAAAAAEwAAAAAAAAAKYmxuZF90b2tlbgAAAAAAEwAAAAAAAAAMcG9vbF9mYWN0b3J5AAAAEwAAAAAAAAAJZHJvcF9saXN0AAAAAAAD7AAAABMAAAALAAAAAA==',
      'AAAAAAAAAAAAAAAHZGVwb3NpdAAAAAADAAAAAAAAAARmcm9tAAAAEwAAAAAAAAAMcG9vbF9hZGRyZXNzAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAQAAAAs=',
      'AAAAAAAAAAAAAAAQcXVldWVfd2l0aGRyYXdhbAAAAAMAAAAAAAAABGZyb20AAAATAAAAAAAAAAxwb29sX2FkZHJlc3MAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAH0AAAAANRNFcA',
      'AAAAAAAAAAAAAAASZGVxdWV1ZV93aXRoZHJhd2FsAAAAAAADAAAAAAAAAARmcm9tAAAAEwAAAAAAAAAMcG9vbF9hZGRyZXNzAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==',
      'AAAAAAAAAAAAAAAId2l0aGRyYXcAAAADAAAAAAAAAARmcm9tAAAAEwAAAAAAAAAMcG9vbF9hZGRyZXNzAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAQAAAAs=',
      'AAAAAAAAAAAAAAAMdXNlcl9iYWxhbmNlAAAAAgAAAAAAAAAEcG9vbAAAABMAAAAAAAAABHVzZXIAAAATAAAAAQAAB9AAAAALVXNlckJhbGFuY2UA',
      'AAAAAAAAAAAAAAAJcG9vbF9kYXRhAAAAAAAAAQAAAAAAAAAEcG9vbAAAABMAAAABAAAH0AAAABBQb29sQmFja3N0b3BEYXRh',
      'AAAAAAAAAAAAAAAOYmFja3N0b3BfdG9rZW4AAAAAAAAAAAABAAAAEw==',
      'AAAAAAAAAAAAAAAOZ3VscF9lbWlzc2lvbnMAAAAAAAAAAAAA',
      'AAAAAAAAAAAAAAAKYWRkX3Jld2FyZAAAAAAAAgAAAAAAAAAGdG9fYWRkAAAAAAATAAAAAAAAAAl0b19yZW1vdmUAAAAAAAATAAAAAA==',
      'AAAAAAAAAAAAAAATZ3VscF9wb29sX2VtaXNzaW9ucwAAAAABAAAAAAAAAAxwb29sX2FkZHJlc3MAAAATAAAAAQAAAAs=',
      'AAAAAAAAAAAAAAAFY2xhaW0AAAAAAAADAAAAAAAAAARmcm9tAAAAEwAAAAAAAAAOcG9vbF9hZGRyZXNzZXMAAAAAA+oAAAATAAAAAAAAAAJ0bwAAAAAAEwAAAAEAAAAL',
      'AAAAAAAAAAAAAAAEZHJvcAAAAAAAAAAA',
      'AAAAAAAAAAAAAAAEZHJhdwAAAAMAAAAAAAAADHBvb2xfYWRkcmVzcwAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAACdG8AAAAAABMAAAAA',
      'AAAAAAAAAAAAAAAGZG9uYXRlAAAAAAADAAAAAAAAAARmcm9tAAAAEwAAAAAAAAAMcG9vbF9hZGRyZXNzAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==',
      'AAAAAAAAAAAAAAALZG9uYXRlX3VzZGMAAAAAAwAAAAAAAAAEZnJvbQAAABMAAAAAAAAADHBvb2xfYWRkcmVzcwAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAA=',
      'AAAAAAAAAAAAAAAJZ3VscF91c2RjAAAAAAAAAQAAAAAAAAAMcG9vbF9hZGRyZXNzAAAAEwAAAAA=',
      'AAAAAAAAAAAAAAAOdXBkYXRlX3Rrbl92YWwAAAAAAAAAAAABAAAD7QAAAAIAAAALAAAACw==',
      'AAAABAAAAKFFcnJvciBjb2RlcyBmb3IgdGhlIGJhY2tzdG9wIGNvbnRyYWN0LiBDb21tb24gZXJyb3JzIGFyZSBjb2RlcyB0aGF0IG1hdGNoIHVwIHdpdGggdGhlIGJ1aWx0LWluCmNvbnRyYWN0cyBlcnJvciByZXBvcnRpbmcuIEJhY2tzdG9wIHNwZWNpZmljIGVycm9ycyBzdGFydCBhdCAxMDAwLgAAAAAAAAAAAAANQmFja3N0b3BFcnJvcgAAAAAAAAsAAAAAAAAADUludGVybmFsRXJyb3IAAAAAAAABAAAAAAAAABdBbHJlYWR5SW5pdGlhbGl6ZWRFcnJvcgAAAAADAAAAAAAAABFVbmF1dGhvcml6ZWRFcnJvcgAAAAAAAAQAAAAAAAAAE05lZ2F0aXZlQW1vdW50RXJyb3IAAAAACAAAAAAAAAAMQmFsYW5jZUVycm9yAAAACgAAAAAAAAANT3ZlcmZsb3dFcnJvcgAAAAAAAAwAAAAAAAAACkJhZFJlcXVlc3QAAAAAA+gAAAAAAAAACk5vdEV4cGlyZWQAAAAAA+kAAAAAAAAAFkludmFsaWRSZXdhcmRab25lRW50cnkAAAAAA+oAAAAAAAAAEUluc3VmZmljaWVudEZ1bmRzAAAAAAAD6wAAAAAAAAAHTm90UG9vbAAAAAPs',
      'AAAAAQAAAAAAAAAAAAAAFkJhY2tzdG9wRW1pc3Npb25Db25maWcAAAAAAAIAAAAAAAAAA2VwcwAAAAAGAAAAAAAAAApleHBpcmF0aW9uAAAAAAAG',
      'AAAAAQAAAAAAAAAAAAAAFUJhY2tzdG9wRW1pc3Npb25zRGF0YQAAAAAAAAIAAAAAAAAABWluZGV4AAAAAAAACwAAAAAAAAAJbGFzdF90aW1lAAAAAAAABg==',
      'AAAAAQAAADNUaGUgdXNlciBlbWlzc2lvbiBkYXRhIGZvciB0aGUgcmVzZXJ2ZSBiIG9yIGQgdG9rZW4AAAAAAAAAABBVc2VyRW1pc3Npb25EYXRhAAAAAgAAAAAAAAAHYWNjcnVlZAAAAAALAAAAAAAAAAVpbmRleAAAAAAAAAs=',
      'AAAAAQAAAAAAAAAAAAAAC1Bvb2xVc2VyS2V5AAAAAAIAAAAAAAAABHBvb2wAAAATAAAAAAAAAAR1c2VyAAAAEw==',
      'AAAAAgAAAAAAAAAAAAAAD0JhY2tzdG9wRGF0YUtleQAAAAAHAAAAAQAAAAAAAAALVXNlckJhbGFuY2UAAAAAAQAAB9AAAAALUG9vbFVzZXJLZXkAAAAAAQAAAAAAAAALUG9vbEJhbGFuY2UAAAAAAQAAABMAAAABAAAAAAAAAAhQb29sVVNEQwAAAAEAAAATAAAAAQAAAAAAAAAIUG9vbEVtaXMAAAABAAAAEwAAAAEAAAAAAAAACEJFbWlzQ2ZnAAAAAQAAABMAAAABAAAAAAAAAAlCRW1pc0RhdGEAAAAAAAABAAAAEwAAAAEAAAAAAAAACVVFbWlzRGF0YQAAAAAAAAEAAAfQAAAAC1Bvb2xVc2VyS2V5AA==',
    ]);
  }

  async initialize(
    source: string,
    sign: (txXdr: string) => Promise<string>,
    network: Network,
    txOptions: TxOptions,
    contractArgs: BackstopInitializeArgs
  ): Promise<ContractResult<undefined>> {
    return await invokeOperation<undefined>(
      source,
      sign,
      network,
      txOptions,
      () => undefined,
      this.contract.call('initialize', ...this.spec.funcArgsToScVals('initialize', contractArgs))
    );
  }

  async deposit(
    source: string,
    sign: (txXdr: string) => Promise<string>,
    network: Network,
    txOptions: TxOptions,
    contractArgs: PoolBackstopActionArgs
  ): Promise<ContractResult<i128>> {
    return await invokeOperation<i128>(
      source,
      sign,
      network,
      txOptions,
      (value: string | xdr.ScVal | undefined): i128 | undefined => {
        if (value == undefined) {
          return undefined;
        }
        return this.spec.funcResToNative('deposit', value);
      },
      this.contract.call('deposit', ...this.spec.funcArgsToScVals('deposit', contractArgs))
    );
  }

  async queueWithdrawal(
    source: string,
    sign: (txXdr: string) => Promise<string>,
    network: Network,
    txOptions: TxOptions,
    contractArgs: PoolBackstopActionArgs
  ): Promise<ContractResult<Q4W>> {
    return await invokeOperation<Q4W>(
      source,
      sign,
      network,
      txOptions,
      (value: string | xdr.ScVal | undefined): Q4W | undefined => {
        if (value == undefined) {
          return undefined;
        }
        return this.spec.funcResToNative('queue_withdrawal', value);
      },
      this.contract.call(
        'queue_withdrawal',
        ...this.spec.funcArgsToScVals('queue_withdrawal', contractArgs)
      )
    );
  }

  async dequeueWithdrawal(
    source: string,
    sign: (txXdr: string) => Promise<string>,
    network: Network,
    txOptions: TxOptions,
    contractArgs: PoolBackstopActionArgs
  ): Promise<ContractResult<undefined>> {
    return await invokeOperation<undefined>(
      source,
      sign,
      network,
      txOptions,
      () => undefined,
      this.contract.call(
        'dequeue_withdrawal',
        ...this.spec.funcArgsToScVals('dequeue_withdrawal', contractArgs)
      )
    );
  }

  async withdraw(
    source: string,
    sign: (txXdr: string) => Promise<string>,
    network: Network,
    txOptions: TxOptions,
    contractArgs: PoolBackstopActionArgs
  ): Promise<ContractResult<i128>> {
    return await invokeOperation<i128>(
      source,
      sign,
      network,
      txOptions,
      (value: string | xdr.ScVal | undefined): i128 | undefined => {
        if (value == undefined) {
          return undefined;
        }
        return this.spec.funcResToNative('withdraw', value);
      },
      this.contract.call('withdraw', ...this.spec.funcArgsToScVals('withdraw', contractArgs))
    );
  }

  async gulpEmissions(
    source: string,
    sign: (txXdr: string) => Promise<string>,
    network: Network,
    txOptions: TxOptions
  ): Promise<ContractResult<undefined>> {
    return await invokeOperation<undefined>(
      source,
      sign,
      network,
      txOptions,
      () => undefined,
      this.contract.call('gulp_emissions', ...this.spec.funcArgsToScVals('gulp_emissions', {}))
    );
  }

  async addReward(
    source: string,
    sign: (txXdr: string) => Promise<string>,
    network: Network,
    txOptions: TxOptions,
    contractArgs: AddRewardArgs
  ): Promise<ContractResult<undefined>> {
    return await invokeOperation<undefined>(
      source,
      sign,
      network,
      txOptions,
      () => undefined,
      this.contract.call('add_reward', ...this.spec.funcArgsToScVals('add_reward', contractArgs))
    );
  }

  async claim(
    source: string,
    sign: (txXdr: string) => Promise<string>,
    network: Network,
    txOptions: TxOptions,
    contractArgs: BackstopClaimArgs
  ): Promise<ContractResult<i128>> {
    return await invokeOperation<i128>(
      source,
      sign,
      network,
      txOptions,
      () => undefined,
      this.contract.call('claim', ...this.spec.funcArgsToScVals('claim', contractArgs))
    );
  }

  async draw(
    source: string,
    sign: (txXdr: string) => Promise<string>,
    network: Network,
    txOptions: TxOptions,
    contractArgs: DrawArgs
  ): Promise<ContractResult<undefined>> {
    return await invokeOperation<undefined>(
      source,
      sign,
      network,
      txOptions,
      () => undefined,
      this.contract.call('draw', ...this.spec.funcArgsToScVals('draw', contractArgs))
    );
  }

  async donate(
    source: string,
    sign: (txXdr: string) => Promise<string>,
    network: Network,
    txOptions: TxOptions,
    contractArgs: PoolBackstopActionArgs
  ): Promise<ContractResult<undefined>> {
    return await invokeOperation<undefined>(
      source,
      sign,
      network,
      txOptions,
      () => undefined,
      this.contract.call('donate', ...this.spec.funcArgsToScVals('donate', contractArgs))
    );
  }

  async donateUSDC(
    source: string,
    sign: (txXdr: string) => Promise<string>,
    network: Network,
    txOptions: TxOptions,
    contractArgs: PoolBackstopActionArgs
  ): Promise<ContractResult<undefined>> {
    return await invokeOperation<undefined>(
      source,
      sign,
      network,
      txOptions,
      () => undefined,
      this.contract.call('donate_usdc', ...this.spec.funcArgsToScVals('donate_usdc', contractArgs))
    );
  }

  async gulpUSDC(
    source: string,
    sign: (txXdr: string) => Promise<string>,
    network: Network,
    txOptions: TxOptions,
    pool_address: Address | string
  ): Promise<ContractResult<undefined>> {
    return await invokeOperation<undefined>(
      source,
      sign,
      network,
      txOptions,
      () => undefined,
      this.contract.call('gulp_usdc', ...this.spec.funcArgsToScVals('gulp_usdc', { pool_address }))
    );
  }

  async updateTokenValue(
    source: string,
    sign: (txXdr: string) => Promise<string>,
    network: Network,
    txOptions: TxOptions
  ): Promise<ContractResult<[i128, i128]>> {
    return await invokeOperation<[i128, i128]>(
      source,
      sign,
      network,
      txOptions,
      (value: string | xdr.ScVal | undefined): [i128, i128] | undefined => {
        if (value == undefined) {
          return undefined;
        }
        return this.spec.funcResToNative('update_tkn_val', value);
      },
      this.contract.call('update_tkn_val', ...this.spec.funcArgsToScVals('update_tkn_val', {}))
    );
  }

  async drop(
    source: string,
    sign: (txXdr: string) => Promise<string>,
    network: Network,
    txOptions: TxOptions
  ): Promise<ContractResult<undefined>> {
    return await invokeOperation<undefined>(
      source,
      sign,
      network,
      txOptions,
      () => undefined,
      this.contract.call('drop', ...this.spec.funcArgsToScVals('drop', {}))
    );
  }
}
