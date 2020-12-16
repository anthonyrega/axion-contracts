import { TokenInstance } from '../../types/truffle-contracts';
const tokenSnapshot = require('../../real-snapshots/main-token-snapshot.json');
import _ from 'lodash';

export async function restoreTokenSnapshot(token: TokenInstance) {
  console.log('restoreTokenSnapshot');

  let userAddresses: string[] = [];
  let amounts: string[] = [];

  for (const userAddress of Object.keys(tokenSnapshot.balanceOf)) {
    userAddresses.push(userAddress);
    amounts.push(tokenSnapshot.balanceOf[userAddress]);
    if (userAddresses.length === 20) {
      const last = _.last(userAddresses);
      await token
        .bulkMint(userAddresses, amounts)
        .then(() => console.log('bulkMint', last));

      userAddresses = [];
      amounts = [];
    }
  }

  if (userAddresses.length > 0) {
    const last = _.last(userAddresses);
    await token
      .bulkMint(userAddresses, amounts)
      .then(() => console.log('bulkMint', last));
  }

  console.log('restoreTokenSnapshot - Done');
  console.log('---------------------------------');
}