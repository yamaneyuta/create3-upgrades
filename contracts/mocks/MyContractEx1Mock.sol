// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * アップグレード用のコントラクト (MyContractMockからアップグレードする際に使用する)
 */
contract MyContractEx1Mock is Initializable, OwnableUpgradeable {
    uint256 public foo;
    uint256 public bar;
    uint256 public baz;

    error NotInitialized(string message);
    error UnableToInitialize(); // 初期化できないエラー

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function upgrade(uint256 _baz) public reinitializer(2) {
        if(foo == 0) {
            revert NotInitialized("foo is not initialized");
        }
        if(bar == 0) {
            revert NotInitialized("bar is not initialized");
        }
        baz = _baz;
    }


    /**
     * 初期化関数
     * ※ MyContractMockのinitialize関数とは、_bazの初期値が異なることに注意 
     */
    /// @custom:oz-upgrades-validate-as-initializer
    function initialize(address _initialOwner, uint256 _foo, uint256 _bar, uint256 _baz) public initializer {
        // 今回はアップグレードのみ行うため適当にエラーとしておく。
        // ※ この関数自体を削除するのはhardhatのチェック時にエラーとなる
        if(true) {
            revert UnableToInitialize();
        }
        
        __Ownable_init(_initialOwner);
        foo = _foo;
        bar = _bar;
        baz = _baz;
    }
}
