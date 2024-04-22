// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "solady/src/utils/CREATE3.sol";

contract Create3 is Initializable, OwnableUpgradeable {
    event Deployed(address deployed, bytes32 salt);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        // 実装コントラクトの初期化を防ぐ
        // https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable#initializing_the_implementation_contract
        _disableInitializers();
    }
    
    function initialize() public initializer {
        __Ownable_init(_msgSender());
    }


    function deploy(bytes32 salt, bytes memory creationCode, uint256 value) external {
        address deployed = CREATE3.deploy(salt, creationCode, value);
        emit Deployed(deployed, salt);
    }

    function getDeployed(bytes32 salt) external view returns (address deployed) {
        deployed = CREATE3.getDeployed(salt);
    }
    function getDeployed(bytes32 salt, address deployer) external pure returns (address deployed) {
        deployed = CREATE3.getDeployed(salt, deployer);
    }
}

