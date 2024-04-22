import { ethers, upgrades } from "hardhat";
import { Create3 } from "../typechain-types";

import Create3Meta from "../artifacts/contracts/Create3.sol/Create3.json";

/**
 * アップグレード可能なCreate3コントラクトをデプロイします。
 */
export const deployUpgradeableCreate3 = async ()=> {
    // 事前チェック
    await verifyProvider();

    const factory = new ethers.ContractFactory(Create3Meta.abi, Create3Meta.bytecode, await ethers.provider.getSigner());
    
    // const factory = await ethers.getContractFactory("Create3");
    const create3 = await upgrades.deployProxy(factory, []);
    return (await create3.waitForDeployment()) as unknown as Create3;
};

const verifyProvider = async () => {
    // デプロイするアカウントのアドレスを取得
    const address = (await ethers.provider.getSigner()).address;
    // デプロイするアカウントのnonceを取得
    const nonce = await ethers.provider.getTransactionCount(address);

    // 本プロジェクトでは、nonceが0であることを前提としている
    if (nonce !== 0) {
        throw new Error("The nonce of the deployer account is not 0. Please use another account.");
    }
};

