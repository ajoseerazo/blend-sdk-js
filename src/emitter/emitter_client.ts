import { Address, Contract, ContractSpec } from 'stellar-sdk';
import { i128, u64, Option, Swap } from '../index.js';

// @dev ENCODING REQUIRES PROPERTY NAMES TO MATCH RUST NAMES

export interface EmitterInitializeArgs {
  blnd_token: Address | string;
  backstop: Address | string;
  backstop_token: Address | string;
}

export interface QueueSwapBackstopArgs {
  new_backstop: Address | string;
  new_backstop_token: Address | string;
}

export class EmitterClient {
  contract: Contract;
  spec: ContractSpec;

  constructor(address: string) {
    this.contract = new Contract(address);
    // @dev: Generated from soroban-cli Typescript bindings
    this.spec = new ContractSpec([
      'AAAAAQAAAAAAAAAAAAAABFN3YXAAAAADAAAAAAAAAAxuZXdfYmFja3N0b3AAAAATAAAAAAAAABJuZXdfYmFja3N0b3BfdG9rZW4AAAAAABMAAAAAAAAAC3VubG9ja190aW1lAAAAAAY=',
      'AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAwAAAAAAAAAKYmxuZF90b2tlbgAAAAAAEwAAAAAAAAAIYmFja3N0b3AAAAATAAAAAAAAAA5iYWNrc3RvcF90b2tlbgAAAAAAEwAAAAA=',
      'AAAAAAAAAAAAAAAKZGlzdHJpYnV0ZQAAAAAAAAAAAAEAAAAL',
      'AAAAAAAAAAAAAAAPZ2V0X2xhc3RfZGlzdHJvAAAAAAEAAAAAAAAAC2JhY2tzdG9wX2lkAAAAABMAAAABAAAABg==',
      'AAAAAAAAAAAAAAAMZ2V0X2JhY2tzdG9wAAAAAAAAAAEAAAAT',
      'AAAAAAAAAAAAAAATcXVldWVfc3dhcF9iYWNrc3RvcAAAAAACAAAAAAAAAAxuZXdfYmFja3N0b3AAAAATAAAAAAAAABJuZXdfYmFja3N0b3BfdG9rZW4AAAAAABMAAAAA',
      'AAAAAAAAAAAAAAAPZ2V0X3F1ZXVlZF9zd2FwAAAAAAAAAAABAAAD6AAAB9AAAAAEU3dhcA==',
      'AAAAAAAAAAAAAAAUY2FuY2VsX3N3YXBfYmFja3N0b3AAAAAAAAAAAA==',
      'AAAAAAAAAAAAAAANc3dhcF9iYWNrc3RvcAAAAAAAAAAAAAAA',
      'AAAAAAAAAAAAAAAEZHJvcAAAAAEAAAAAAAAABGxpc3QAAAPsAAAAEwAAAAsAAAAA',
      'AAAABAAAAJ9FcnJvciBjb2RlcyBmb3IgdGhlIGVtaXR0ZXIgY29udHJhY3QuIENvbW1vbiBlcnJvcnMgYXJlIGNvZGVzIHRoYXQgbWF0Y2ggdXAgd2l0aCB0aGUgYnVpbHQtaW4KY29udHJhY3RzIGVycm9yIHJlcG9ydGluZy4gRW1pdHRlciBzcGVjaWZpYyBlcnJvcnMgc3RhcnQgYXQgMTEwMC4AAAAAAAAAAAxFbWl0dGVyRXJyb3IAAAAJAAAAAAAAAA1JbnRlcm5hbEVycm9yAAAAAAAAAQAAAAAAAAAXQWxyZWFkeUluaXRpYWxpemVkRXJyb3IAAAAAAwAAAAAAAAARVW5hdXRob3JpemVkRXJyb3IAAAAAAAAEAAAAAAAAABhJbnN1ZmZpY2llbnRCYWNrc3RvcFNpemUAAARMAAAAAAAAAAdCYWREcm9wAAAABE0AAAAAAAAADVN3YXBOb3RRdWV1ZWQAAAAAAAROAAAAAAAAABFTd2FwQWxyZWFkeUV4aXN0cwAAAAAABE8AAAAAAAAAD1N3YXBOb3RVbmxvY2tlZAAAAARQAAAAAAAAABRTd2FwQ2Fubm90QmVDYW5jZWxlZAAABFE=',
      'AAAAAgAAAAAAAAAAAAAADkVtaXR0ZXJEYXRhS2V5AAAAAAACAAAAAQAAAAAAAAAKTGFzdERpc3RybwAAAAAAAQAAABMAAAABAAAAAAAAAAdEcm9wcGVkAAAAAAEAAAAT',
    ]);
  }

  readonly parsers = {
    initialize: () => {},
    distribute: (result: string): i128 => this.spec.funcResToNative('distribute', result),
    getLastDistro: (result: string): u64 => this.spec.funcResToNative('get_last_distro', result),
    getBackstop: (result: string): string => this.spec.funcResToNative('get_backstop', result),
    queueSwapBackstop: () => {},
    getQueuedSwap: (result: string): Option<Swap> =>
      this.spec.funcResToNative('get_queued_swap', result),
    cancelSwapBackstop: () => {},
    swapBackstop: () => {},
    drop: () => {},
  };

  initialize(contractArgs: EmitterInitializeArgs): string {
    return this.contract
      .call('initialize', ...this.spec.funcArgsToScVals('initialize', contractArgs))
      .toXDR('base64');
  }

  distribute(): string {
    return this.contract
      .call('distribute', ...this.spec.funcArgsToScVals('distribute', {}))
      .toXDR('base64');
  }

  queueSwapBackstop(contractArgs: QueueSwapBackstopArgs): string {
    return this.contract
      .call(
        'queue_swap_backstop',
        ...this.spec.funcArgsToScVals('queue_swap_backstop', contractArgs)
      )
      .toXDR('base64');
  }

  cancelSwapBackstop(): string {
    return this.contract
      .call('cancel_swap_backstop', ...this.spec.funcArgsToScVals('cancel_swap_backstop', {}))
      .toXDR('base64');
  }

  swapBackstop(): string {
    return this.contract
      .call('swap_backstop', ...this.spec.funcArgsToScVals('swap_backstop', {}))
      .toXDR('base64');
  }

  drop(): string {
    return this.contract.call('drop', ...this.spec.funcArgsToScVals('drop', {})).toXDR('base64');
  }
}
