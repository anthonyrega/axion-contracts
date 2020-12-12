import { restoreAuctionSnapshot } from './restore-snapshot-scripts/restore_auction_snapshot';
import { restoreBPDSnapshot } from './restore-snapshot-scripts/restore_bpd_snapshot';
import { restoreForeignSwapSnapshot } from './restore-snapshot-scripts/restore_foreignswap_snapshot';
import { restoreNativeSwapSnapshot } from './restore-snapshot-scripts/restore_nativeswap_snapshot';
import { restoreSubBalancesSnapshot } from './restore-snapshot-scripts/restore_subbalances_snapshot';
import { restoreTokenSnapshot } from './restore-snapshot-scripts/restore_token';
import { getDeployedContracts } from './utils/get_deployed_contracts';
import { restoreStakingSnapshot } from './restore-snapshot-scripts/restore_staking_snapshot';

module.exports = async function (deployer, network) {
  if (!process.argv.includes('migrate')) {
    return;
  }

  try {
    console.log('RESTORE SNAPSHOTS');
    console.log(`Running on network: ${network}`);

    const {
      auction,
      bpd,
      foreignSwap,
      nativeSwap,
      token,
      subBalances,
      staking,
    } = await getDeployedContracts(network);

    await restoreBPDSnapshot(bpd, token);
    await restoreNativeSwapSnapshot(nativeSwap);
    await restoreForeignSwapSnapshot(foreignSwap);
    await restoreAuctionSnapshot(auction, token);
    await restoreSubBalancesSnapshot(subBalances);
    await restoreStakingSnapshot(staking, token);

    // Todo: run the airdrop separately
    // await restoreTokenSnapshot(token);

    console.log(
      '============================RESTORE SNAPSHOTS: DONE==============================='
    );
  } catch (err) {
    console.error(err);
    console.error(
      '============================RESTORE SNAPSHOTS: FAILED==============================='
    );
    process.exit();
  }
} as Truffle.Migration;

// because of https://stackoverflow.com/questions/40900791/cannot-redeclare-block-scoped-variable-in-unrelated-files
export {};
