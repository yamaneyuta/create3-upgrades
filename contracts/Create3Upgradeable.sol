// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "solady/src/utils/CREATE3.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

abstract contract Create3Upgradeable is Initializable, ContextUpgradeable {
    event Deployed(address indexed account, bytes32 indexed salt, address indexed deployed);

    function __Create3_init() internal onlyInitializing {
    }

    function deploy(bytes32 salt, bytes memory creationCode, uint256 value) external {
        address deployed = CREATE3.deploy(salt, creationCode, value);
        emit Deployed( _msgSender(), salt, deployed);
    }

    function getDeployed(bytes32 salt) external view returns (address deployed) {
        deployed = CREATE3.getDeployed(salt);
    }
    function _getDeployed(bytes32 salt, address deployer) internal pure returns (address deployed) {
        deployed = CREATE3.getDeployed(salt, deployer);
    }
}

