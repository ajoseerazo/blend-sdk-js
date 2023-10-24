import { Server, SorobanRpc, TransactionBuilder } from 'soroban-client';
import { Buffer } from 'buffer';

import './backstop/index.js';
import './emitter/index.js';
import './pool/index.js';
import './pool_factory/index.js';

export * from './contract_result.js';
export * from './tx.js';

export type u32 = number;
export type i32 = number;
export type u64 = bigint;
export type i64 = bigint;
export type u128 = bigint;
export type i128 = bigint;
export type Option<T> = T | undefined;

export type SorobanResponse =
  | SorobanRpc.SimulateTransactionResponse
  | SorobanRpc.SendTransactionResponse
  | SorobanRpc.GetTransactionResponse;

export interface Network {
  rpc: string;
  passphrase: string;
  opts?: Server.Options;
}

export interface TxOptions {
  sim: boolean;
  pollingInterval: number;
  timeout: number;
  builderOptions: TransactionBuilder.TransactionBuilderOptions;
}

if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}
