import { ethers } from "hardhat";

/**
 * `deployUpgradeableCreate3`実行前の事前チェックを行います。
 */
export const preDeployUpgradeableCreate3 = async () => {
    // デプロイするアカウントのアドレスを取得
    const address = (await ethers.provider.getSigner()).address;
    // デプロイするアカウントのnonceを取得
    const nonce = await ethers.provider.getTransactionCount(address);

    // 本プロジェクトでは、nonceが0であることを前提としている
    if (nonce !== 0) {
        throw new Error("[D042CA04] The nonce of the deployer account is not 0. Please use another account.");
    }
};
