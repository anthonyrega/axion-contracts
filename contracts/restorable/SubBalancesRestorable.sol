// SPDX-License-Identifier: MIT

pragma solidity >=0.4.25 <0.7.0;
/** OpenZeppelin Dependencies Upgradeable */
// import "@openzeppelin/contracts-upgradeable/contracts/proxy/Initializable.sol";
import '@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';
/** OpenZepplin non-upgradeable Swap Token (hex3t) */
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
/** Local Interfaces */
import '../SubBalances.sol';

contract SubBalancesRestorable is SubBalances {
    /* Setter methods for contract migration */
    function setNormalVariables(
        uint256 _currentSharesTotalSupply,
        uint256[5] calldata _periods,
        uint256 _startTimestamp
    ) external onlyMigrator {
        currentSharesTotalSupply = _currentSharesTotalSupply;
        periods = _periods;
        startTimestamp = _startTimestamp;
    }

    function maxShareMigratorHelper(
        uint256 sessionId,
        uint256 end,
        uint256 shares
    ) external onlyMigrator {
        StakeSession storage session = stakeSessions[sessionId];

        require(
            end > session.start,
            'SUBBALANCES: Stake end must be after stake start'
        );

        session.shares = shares;
        session.end = end;
        session.payDayEligible = [true, true, true, true, true];
    }

    function addBPDShares(uint256[5] calldata _shares) external onlyMigrator {
        for (uint256 i = 0; i < 5; i++) {
            SubBalance storage subBalance = subBalanceList[i];
            uint256 _sharesToAdd = _shares[i];
            subBalance.totalShares = subBalance.totalShares.add(_sharesToAdd);
        }
    }

    function setSubBalanceList(
        uint256[5] calldata _totalSharesList,
        uint256[5] calldata _totalWithdrawAmountList,
        uint256[5] calldata _payDayTimeList,
        uint256[5] calldata _requiredStakePeriodList,
        bool[5] calldata _mintedList
    ) external onlyMigrator {
        for (uint256 idx = 0; idx < 5; idx = idx + 1) {
            subBalanceList[idx] = SubBalance({
                totalShares: _totalSharesList[idx],
                totalWithdrawAmount: _totalWithdrawAmountList[idx],
                payDayTime: _payDayTimeList[idx],
                requiredStakePeriod: _requiredStakePeriodList[idx],
                minted: _mintedList[idx]
            });
        }
    }

    function addStakeSessions(
        uint256[] calldata _sessionIds,
        address[] calldata _stakers,
        uint256[] calldata _sharesList,
        uint256[] calldata _startList,
        uint256[] calldata _endList,
        uint256[] calldata _finishTimeList,
        bool[] calldata _payDayEligibleList
    ) external onlyMigrator {
        for (
            uint256 sessionIdx = 0;
            sessionIdx < _sessionIds.length;
            sessionIdx = sessionIdx + 1
        ) {
            uint256 sessionId = _sessionIds[sessionIdx];
            bool[5] memory payDayEligible;
            for (uint256 boolIdx = 0; boolIdx < 5; boolIdx = boolIdx + 1) {
                payDayEligible[boolIdx] = _payDayEligibleList[
                    5 * sessionIdx + boolIdx
                ];
            }

            address staker = _stakers[sessionIdx];

            stakeSessions[sessionId] = StakeSession({
                staker: staker,
                shares: _sharesList[sessionIdx],
                start: _startList[sessionIdx],
                end: _endList[sessionIdx],
                finishTime: _finishTimeList[sessionIdx],
                payDayEligible: payDayEligible,
                withdrawn: false
            });
        }
    }
}
