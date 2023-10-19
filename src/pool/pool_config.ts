import { Address, xdr, Server, scValToNative } from 'soroban-client';
import { Network } from '../index.js';
import { decodeEntryKey } from '../ledger_entry_helper.js';

export class PoolConfig {
  constructor(
    public admin: string,
    public name: string,
    public blndTkn: string,
    public usdcTkn: string,
    public backstop: string,
    public backstopRate: number,
    public oracle: string,
    public status: number,
    public reserveList: string[]
  ) {}

  static async load(network: Network, poolId: string) {
    const SorobanRpc = new Server(network.rpc, network.opts);
    const contractInstanceKey = xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: Address.fromString(poolId).toScAddress(),
        key: xdr.ScVal.scvLedgerKeyContractInstance(),
        durability: xdr.ContractDataDurability.persistent(),
      })
    );
    const reserveListDataKey = xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: Address.fromString(poolId).toScAddress(),
        key: xdr.ScVal.scvSymbol('ResList'),
        durability: xdr.ContractDataDurability.persistent(),
      })
    );
    let admin: string | undefined;
    let name: string | undefined;
    let blndTkn: string | undefined;
    let usdcTkn: string | undefined;
    let backstop: string | undefined;
    let backstopRate: number | undefined;
    let oracle: string | undefined;
    let status: number | undefined;
    let reserveList: string[] | undefined;

    const poolConfigEntries =
      (await SorobanRpc.getLedgerEntries(contractInstanceKey, reserveListDataKey)).entries ?? [];

    for (const entry of poolConfigEntries) {
      const ledgerData = xdr.LedgerEntryData.fromXDR(entry.xdr, 'base64').contractData();
      const key = decodeEntryKey(ledgerData.key());
      switch (key) {
        case 'ContractInstance': {
          ledgerData
            .val()
            .instance()
            .storage()
            ?.map((entry) => {
              const instanceKey = decodeEntryKey(entry.key());
              switch (instanceKey) {
                case 'Admin':
                  admin = Address.fromScVal(entry.val()).toString();
                  return;
                case 'BLNDTkn':
                  blndTkn = Address.fromScVal(entry.val()).toString();
                  return;
                case 'Backstop':
                  backstop = Address.fromScVal(entry.val()).toString();
                  return;
                case 'USDCTkn':
                  usdcTkn = Address.fromScVal(entry.val()).toString();
                  return;
                case 'PoolConfig':
                  entry
                    .val()
                    .map()
                    ?.map((config_entry) => {
                      const poolConfigKey = decodeEntryKey(config_entry.key());
                      switch (poolConfigKey) {
                        case 'bstop_rate':
                          backstopRate = Number(config_entry.val().u64().toString());
                          return;
                        case 'oracle':
                          oracle = Address.fromScVal(config_entry.val()).toString();
                          return;
                        case 'status':
                          status = scValToNative(config_entry.val());
                          return;
                        default:
                          throw Error(
                            `Invalid pool config key: should not contain ${poolConfigKey}`
                          );
                      }
                    });
                  if (backstopRate == undefined || oracle == undefined || status == undefined) {
                    throw new Error();
                  }
                  return;
                case 'Name':
                  name = entry.val().sym().toString();
                  return;
                default:
                  throw Error(
                    `Invalid pool instance storage key: should not contain ${instanceKey}`
                  );
              }
            });
          break;
        }
        case 'ResList':
          reserveList = scValToNative(ledgerData.val());
          break;
        default:
          throw Error(`Invalid PoolConfig key: should not contain ${key}`);
      }
    }
    if (
      admin == undefined ||
      name == undefined ||
      blndTkn == undefined ||
      usdcTkn == undefined ||
      backstop == undefined ||
      backstopRate == undefined ||
      oracle == undefined ||
      status == undefined ||
      reserveList == undefined ||
      poolConfigEntries.length == 0
    ) {
      throw Error('Unable to load pool config');
    }
    return new PoolConfig(
      admin,
      name,
      blndTkn,
      usdcTkn,
      backstop,
      backstopRate,
      oracle,
      status,
      reserveList
    );
  }
}
