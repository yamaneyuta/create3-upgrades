// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { MyContractMock } from "./MyContractMock.sol";

/**
 * コントラクトを継承した、アップグレード用のコントラクト 
 */
contract MyContractEx1Mock is MyContractMock {

    uint256 public baz;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(uint256 _baz) public reinitializer(2) {
        baz = _baz;
    }
}
