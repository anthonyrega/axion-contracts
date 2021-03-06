import dotenv from 'dotenv';
dotenv.config();

import { network } from 'hardhat';
import { getRestorableDeployedContracts } from './utils/get_restorable_deployed_contracts';
import { restoreBPDSnapshot } from './restore-snapshot/restore_bpd_snapshot';
import { restoreNativeSwapSnapshot } from './restore-snapshot/restore_nativeswap_snapshot';
import { restoreForeignSwapSnapshot } from './restore-snapshot/restore_foreignswap_snapshot';
import { restoreAuctionSnapshot } from './restore-snapshot/restore_auction_snapshot';
import { restoreSubBalancesSnapshot } from './restore-snapshot/restore_subbalances_snapshot';
import { restoreStakingSnapshot } from './restore-snapshot/restore_staking_snapshot';
import { airdropTokens } from './restore-snapshot/restore_token';

/**
 * This script does not work anymore, the setters methods have been removed from the contracts
 **/
const SCRIPT_NAME = 'RESTORE SNAPSHOTS';

const main = async () => {
  const networkName = network.name;

  try {
    console.log(
      `============================ ${SCRIPT_NAME} ===============================`
    );
    console.log(`Running on network: ${networkName}`);

    const {
      auctionRestorable,
      bpdRestorable,
      foreignSwapRestorable,
      nativeSwapRestorable,
      tokenRestorable,
      subBalancesRestorable,
      stakingRestorable,
    } = await getRestorableDeployedContracts(networkName);

    await restoreBPDSnapshot(bpdRestorable, tokenRestorable);
    await restoreNativeSwapSnapshot(nativeSwapRestorable);
    await restoreForeignSwapSnapshot(foreignSwapRestorable);
    await restoreAuctionSnapshot(auctionRestorable, tokenRestorable);
    await restoreSubBalancesSnapshot(subBalancesRestorable);
    await restoreStakingSnapshot(stakingRestorable, tokenRestorable);
    await airdropTokens(
      tokenRestorable,
      process.env.AIR_DROPPER_ADDRESS ??
        '0x902634D7451277d46353969D5a4Ad56b71d08D6E'
    );

    console.log(
      `============================ ${SCRIPT_NAME}: DONE ===============================`
    );
  } catch (e) {
    console.error(
      `============================ ${SCRIPT_NAME}: FAILED ===============================`
    );
    throw e;
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
