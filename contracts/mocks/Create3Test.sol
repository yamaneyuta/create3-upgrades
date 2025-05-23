// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Create3Upgradeable } from "../Create3Upgradeable.sol";


/**
 * Create3Upgradeableを継承したテスト用のコントラクト
 */
contract Create3Test is Create3Upgradeable {

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        // 実装コントラクトの初期化を防ぐ
        // solhint-disable-next-line max-line-length
        // https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable#initializing_the_implementation_contract
        _disableInitializers();
    }
    
    // solhint-disable-next-line no-empty-blocks
    function initialize() public initializer { }


    function deploy(bytes32 salt, bytes memory creationCode, uint256 value) external {
        _deploy(salt, creationCode, value);
    }

    function getDeployed(bytes32 salt) external view returns (address deployed) {
        deployed = _getDeployed(salt);
    }
}

