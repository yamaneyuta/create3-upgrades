"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preDeployUpgradeableCreate3 = void 0;
const hardhat_1 = require("hardhat");
/**
 * `deployUpgradeableCreate3`実行前の事前チェックを行います。
 */
const preDeployUpgradeableCreate3 = async () => {
    // デプロイするアカウントのアドレスを取得
    const address = (await hardhat_1.ethers.provider.getSigner()).address;
    // デプロイするアカウントのnonceを取得
    const nonce = await hardhat_1.ethers.provider.getTransactionCount(address);
    // 本プロジェクトでは、nonceが0であることを前提としている
    if (nonce !== 0) {
        throw new Error("[D042CA04] The nonce of the deployer account is not 0. Please use another account.");
    }
};
exports.preDeployUpgradeableCreate3 = preDeployUpgradeableCreate3;
