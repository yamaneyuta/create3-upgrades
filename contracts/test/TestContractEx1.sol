// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { TestContract } from "./TestContract.sol";

/**
 * コントラクトを継承した、アップグレード用のコントラクト 
 */
contract TestContractEx1 is TestContract {

    uint256 public fuga;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(uint256 _fuga) public reinitializer(2) {
        fuga = _fuga;
    }
}
