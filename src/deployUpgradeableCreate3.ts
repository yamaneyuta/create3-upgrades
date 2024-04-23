import { ethers, upgrades } from "hardhat";
import { Create3 } from "../typechain-types";
import Create3Meta from "../artifacts/contracts/Create3.sol/Create3.json";
import { preDeployUpgradeableCreate3 } from "./preDeployUpgradeableCreate3";

/**
 * アップグレード可能なCreate3コントラクトをデプロイします。
 */
export const deployUpgradeableCreate3 = async ()=> {
    // 事前チェック
    await preDeployUpgradeableCreate3();

    const factory = new ethers.ContractFactory(Create3Meta.abi, Create3Meta.bytecode, await ethers.provider.getSigner());
    
    // Create3コントラクトのコンストラクタ引数は無し
    const create3Args = [] as unknown[];

    // Create3コントラクトをデプロイ
    const create3 = await upgrades.deployProxy(factory, create3Args);
    return (await create3.waitForDeployment()) as unknown as Create3;
};
