import { upgrades } from "hardhat";
import { deployProxyWithCreate3 } from "./deployProxyWithCreate3";
type Create3Upgrades = {
    deployProxy: typeof deployProxyWithCreate3;
    upgradeProxy: typeof upgrades.upgradeProxy;
};
export declare const create3Upgrades: Create3Upgrades;
export {};
