// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface ICreate3Upgradeable {
    event Deployed(address indexed account, bytes32 indexed salt, address indexed deployed);

    function deploy(bytes32 salt, bytes memory creationCode, uint256 value) external;

    function getDeployed(bytes32 salt) external view returns (address deployed);
    
}
