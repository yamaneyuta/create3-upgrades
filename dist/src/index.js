"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create3Upgrades = void 0;
const hardhat_1 = require("hardhat");
const deployProxyWithCreate3_1 = require("./deployProxyWithCreate3");
exports.create3Upgrades = {
    deployProxy: deployProxyWithCreate3_1.deployProxyWithCreate3,
    upgradeProxy: hardhat_1.upgrades.upgradeProxy
};
