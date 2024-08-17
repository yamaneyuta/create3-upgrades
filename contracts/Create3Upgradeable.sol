// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import { CREATE3 } from "solady/src/utils/CREATE3.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { ICreate3Upgradeable } from "./ICreate3Upgradeable.sol";

abstract contract Create3Upgradeable is Initializable, ContextUpgradeable, ICreate3Upgradeable {

    // solhint-disable-next-line func-name-mixedcase, no-empty-blocks
    function __Create3_init() internal onlyInitializing { }

    function _deploy(bytes32 salt, bytes memory creationCode, uint256 value) internal virtual {
        address deployed = CREATE3.deploy(salt, creationCode, value);
        emit Deployed(_msgSender(), salt, deployed);
    }

    function _getDeployed(bytes32 salt) internal virtual view returns (address deployed) {
        deployed = CREATE3.getDeployed(salt);
    }
}

