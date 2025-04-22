// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { Create3Upgradeable } from "../Create3Upgradeable.sol";

contract Create3Mock is Initializable, OwnableUpgradeable, Create3Upgradeable {

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        // 実装コントラクトの初期化を防ぐ
        // solhint-disable-next-line max-line-length
        // https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable#initializing_the_implementation_contract
        _disableInitializers();
    }
    
    function initialize() public initializer {
        __Ownable_init(_msgSender());
    }


    function deploy(bytes32 salt, bytes memory creationCode, uint256 value) external {
        _deploy(salt, creationCode, value);
    }

    function getDeployed(bytes32 salt) external view returns (address deployed) {
        deployed = _getDeployed(salt);
    }

    // function getDeployed(bytes32 salt, address deployer) external pure returns (address deployed) {
    //     deployed = _getDeployed(salt, deployer);
    // }
}

