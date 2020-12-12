import dotenv from 'dotenv';
dotenv.config();
import { deployProxy } from '@openzeppelin/truffle-upgrades';
import {
  AuctionInstance,
  BPDInstance,
  ForeignSwapInstance,
  NativeSwapInstance,
  StakingInstance,
  SubBalancesInstance,
  TokenInstance,
} from '../types/truffle-contracts';
import fs from 'fs';
import path from 'path';
import { TEST_NETWORKS } from './utils/get_deployed_contracts';

const Auction = artifacts.require('Auction');
const BPD = artifacts.require('BPD');
const ForeignSwap = artifacts.require('ForeignSwap');
const NativeSwap = artifacts.require('NativeSwap');
const Staking = artifacts.require('Staking');
const SubBalances = artifacts.require('SubBalances');
const Token = artifacts.require('Token');

module.exports = async function (
  deployer,
  network,
  [setterAddress, managerAddress]
) {
  if (!process.argv.includes('migrate')) {
    return;
  }

  try {
    console.log('DEPLOYING CONTRACTS');
    console.log(`Running on network: ${network}`);
    const {
      DEPLOYER_ADDRESS,
      MANAGER_ADDRESS,
      SWAP_TOKEN_ADDRESS,
    } = process.env;

    if (!TEST_NETWORKS.includes(network)) {
      [DEPLOYER_ADDRESS].forEach((value) => {
        if (!value) {
          throw new Error('Please set the value in .env file');
        }
      });
    }

    const setter = DEPLOYER_ADDRESS ?? setterAddress;
    const manager = MANAGER_ADDRESS ?? managerAddress;

    // Auction
    const auction = (await deployProxy(Auction as any, [manager, setter], {
      unsafeAllowCustomTypes: true,
      unsafeAllowLinkedLibraries: true,
    }).then((instance) => {
      console.log('Deployed: Auction', instance.address);
      return instance;
    })) as AuctionInstance;

    // Token
    const hex4t: TokenInstance | undefined = SWAP_TOKEN_ADDRESS
      ? ((await Promise.resolve()) as any)
      : ((await deployProxy(Token as any, [manager, setter, 'HEX4T', 'HEX4T'], {
          unsafeAllowCustomTypes: true,
          unsafeAllowLinkedLibraries: true,
        }).then((instance) => {
          console.log('Deployed: HEX4T', instance.address);
          return instance;
        })) as TokenInstance);

    // AXN
    const token = (await deployProxy(
      Token as any,
      [manager, setter, 'Axion Token', 'AXN'],
      {
        unsafeAllowCustomTypes: true,
        unsafeAllowLinkedLibraries: true,
      }
    ).then((instance) => {
      console.log('Deployed: Axion Token', instance.address);
      return instance;
    })) as TokenInstance;

    // Native Swap
    const nativeswap = (await deployProxy(
      NativeSwap as any,
      [manager, setter],
      {
        unsafeAllowCustomTypes: true,
        unsafeAllowLinkedLibraries: true,
      }
    ).then((instance) => {
      console.log('Deployed: NativeSwap', instance.address);
      return instance;
    })) as NativeSwapInstance;

    // BPD
    const bpd = (await deployProxy(BPD as any, [manager, setter], {
      unsafeAllowCustomTypes: true,
      unsafeAllowLinkedLibraries: true,
    }).then((instance) => {
      console.log('Deployed: BPD', instance.address);
      return instance;
    })) as BPDInstance;

    // Foreign Swap
    const foreignswap = (await deployProxy(
      ForeignSwap as any,
      [manager, setter],
      {
        unsafeAllowCustomTypes: true,
        unsafeAllowLinkedLibraries: true,
      }
    ).then((instance) => {
      console.log('Deployed: ForeignSwap', instance.address);
      return instance;
    })) as ForeignSwapInstance;

    // SubBalances
    const subbalances = (await deployProxy(
      SubBalances as any,
      [manager, setter],
      {
        unsafeAllowCustomTypes: true,
        unsafeAllowLinkedLibraries: true,
      }
    ).then((instance) => {
      console.log('Deployed: SubBalances', instance.address);
      return instance;
    })) as SubBalancesInstance;

    // Staking
    const staking = (await deployProxy(Staking as any, [manager, setter], {
      unsafeAllowCustomTypes: true,
      unsafeAllowLinkedLibraries: true,
    }).then((instance) => {
      console.log('Deployed: Staking', instance.address);
      return instance;
    })) as StakingInstance;

    const addressFilePath = path.join(
      __dirname,
      '..',
      'migration-output',
      'address.json'
    );
    fs.writeFileSync(
      addressFilePath,
      JSON.stringify(
        {
          NETWORK: network,
          AUCTION_ADDRESS: auction.address,
          TOKEN_ADDRESS: token.address,
          HEX4T_ADDRESS: hex4t?.address,
          NATIVESWAP_ADDRESS: nativeswap.address,
          BPD_ADDRESS: bpd.address,
          FOREIGNSWAP_ADDRESS: foreignswap.address,
          SUBBALANCES_ADDRESS: subbalances.address,
          STAKING_ADDRESS: staking.address,
        },
        null,
        2
      )
    );
    console.log('Contracts addresses saved to', addressFilePath.toString());

    console.log(
      '============================DEPLOYING CONTRACTS: DONE==============================='
    );
  } catch (err) {
    console.error(err);
    console.error(
      '============================DEPLOYING CONTRACTS: FAILED==============================='
    );

    process.exit();
  }
} as Truffle.Migration;

// because of https://stackoverflow.com/questions/40900791/cannot-redeclare-block-scoped-variable-in-unrelated-files
export {};
