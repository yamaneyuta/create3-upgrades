// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ProxyAdmin } from "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

/**
 * ProxyAdminのTypeScript定義を作成するためのコントラクト 
 */
contract ProxyAdminMock is ProxyAdmin {
    constructor(address initialOwner) ProxyAdmin(initialOwner) {}
}
