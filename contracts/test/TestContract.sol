// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract TestContract is Initializable, OwnableUpgradeable {
    uint256 public foo;
    uint256 public bar;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _initialOwner, uint256 _foo, uint256 _bar) public initializer {
        __Ownable_init(_initialOwner);
        
        foo = _foo;
        bar = _bar;
    }
}
