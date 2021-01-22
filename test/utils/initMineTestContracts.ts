import { ethers } from 'hardhat';
import {
  TERC20,
  TERC721,
  AxionMine,
} from '../../typechain';
import { ContractFactory } from '../../libs/ContractFactory';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';

import { BigNumber } from 'ethers';

interface InitOptions {
  manager: SignerWithAddress;
  bank: SignerWithAddress;
  rewardAmount: BigNumber;
  startBlock: number;
  blockReward: BigNumber;
}

interface AxionContracts {
  rewardToken: TERC20;
  lpToken: TERC20;
  nft1: TERC721;
  nft2: TERC721;
  nft3: TERC721;
  mine: AxionMine;
}

export async function initMineTestContracts({
  manager,
  bank,
  rewardAmount,
  startBlock,
  blockReward
}: InitOptions): Promise<AxionContracts> {

  const rewardToken = await ContractFactory.getTERC20Factory().then((factory) =>
    factory
      .connect(bank)
      .deploy(
        'AXN Token',
        'AXN',
        ethers.utils.parseEther('10000000000'),
        bank.address
      )
  );

  const lpToken = await ContractFactory.getTERC20Factory().then((factory) =>
    factory
      .connect(bank)
      .deploy(
        'LP Token',
        'LP',
        ethers.utils.parseEther('10000000000'),
        bank.address
      )
  );

  const nft1 = await ContractFactory.getTERC721Factory().then((factory) =>
    factory
      .connect(bank)
      .deploy(
        'LP Token',
        'LP'
      )
  );

  const nft2 = await ContractFactory.getTERC721Factory().then((factory) =>
    factory
      .connect(bank)
      .deploy(
        'LP Token',
        'LP'
      )
  );

  const nft3 = await ContractFactory.getTERC721Factory().then((factory) =>
    factory
      .connect(bank)
      .deploy(
        'LP Token',
        'LP'
      )
  );

  const mine = await ContractFactory.getAxionMineFactory().then((factory) =>
    factory
      .connect(bank)
      .deploy(manager.address)
  );

  await rewardToken.approve(mine.address, rewardAmount);

  await mine.initialize(
    rewardToken.address, rewardAmount, lpToken.address, startBlock, blockReward, nft1.address, nft2.address, nft3.address)

  return {
    rewardToken,
    lpToken,
    nft1,
    nft2,
    nft3,
    mine
  };
}
