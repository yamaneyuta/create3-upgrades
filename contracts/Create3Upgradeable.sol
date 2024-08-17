// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import { CREATE3 } from "solady/src/utils/CREATE3.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { ICreate3Upgradeable } from "./ICreate3Upgradeable.sol";

abstract contract Create3Upgradeable is Initializable, ContextUpgradeable, ICreate3Upgradeable {

    // solhint-disable-next-line func-name-mixedcase, no-empty-blocks
    function __Create3_init() internal onlyInitializing { }

    /**
     * コントラクトをデプロイします。
     * ※ 別のウォレットからデプロイしたとしても、同一saltの場合は同一のコントラクトアドレスでデプロイされることに注意してください。
     *    この挙動が好ましくない場合は、以下のような対応を行ってください。
     *    - 継承先でonlyOwnerなどのアクセス制限を追加する
     *    - 継承先でこの関数をオーバーライドし、saltをmsg.sender依存にする
     *      例: salt = keccak256(abi.encodePacked(salt, msg.sender));
     */
    function _deploy(bytes32 salt, bytes memory creationCode, uint256 value) internal virtual {
        address deployed = CREATE3.deploy(salt, creationCode, value);
        emit Deployed(_msgSender(), salt, deployed);
    }

    /**
     * このコントラクト経由でデプロイした時のコントラクトアドレスを取得します。
     */
    function _getDeployed(bytes32 salt) internal virtual view returns (address deployed) {
        deployed = CREATE3.getDeployed(salt);
    }
}

