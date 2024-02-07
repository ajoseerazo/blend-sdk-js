import { xdr } from 'stellar-sdk';

export class ContractError extends Error {
  public type?: string;
  constructor(type: string, message: string) {
    super(message);
    this.type = type;
  }
}

export enum BlendErrors {
  // Common Errors
  InternalError = 1,
  AlreadyInitializedError = 3,

  UnauthorizedError = 4,

  NegativeAmountError = 8,
  BalanceError = 10,
  OverflowError = 12,

  // Backstop
  BackstopBadRequest = 1000,
  NotExpired = 1001,
  InvalidRewardZoneEntry = 1002,
  InsufficientFunds = 1003,
  NotPool = 1004,

  // Pool Request Errors (start at 1200)
  PoolBadRequest = 1200,
  InvalidPoolInitArgs = 1201,
  InvalidReserveMetadata = 1202,
  InitNotUnlocked = 1203,
  StatusNotAllowed = 1204,

  // Pool State Errors
  InvalidHf = 1205,
  InvalidPoolStatus = 1206,
  InvalidUtilRate = 1207,
  MaxPositionsExceeded = 1208,
  InternalReserveNotFound = 1209,

  // Oracle Errors
  StalePrice = 1210,

  // Auction Errors
  InvalidLiquidation = 1211,
  AuctionInProgress = 1212,
  InvalidLiqTooLarge = 1213,
  InvalidLiqTooSmall = 1214,
  InterestTooSmall = 1215,

  // Pool Factory
  InvalidPoolFactoryInitArgs = 1300,
}

export function parseError(errorResult: xdr.TransactionResultResult | string): ContractError {
  if (typeof errorResult === 'string') {
    const match = errorResult.match(/Error\(Contract, #(\d+)\)/);
    // Transaction failed simulation
    if (match) {
      let i = parseInt(match[1], 10);
      let errorType = BlendErrors[i];
      if (errorType) return new ContractError(errorType, errorResult);
      else return new ContractError(undefined, errorResult);
    }
  } else {
    const txError = errorResult.switch().name;
    const invokeError = errorResult
      .results()
      .map((opResult) => {
        return opResult.tr().invokeHostFunctionResult().switch().name;
      })
      .join('-');
    return new ContractError(`${txError}-${invokeError}`, JSON.stringify(errorResult, null, 2));
  }
}
