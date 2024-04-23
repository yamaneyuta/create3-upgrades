
import { upgrades } from "hardhat";
import { deployProxyWithCreate3 } from "./deployProxyWithCreate3";

type Create3Upgrades = {
    deployProxy: typeof deployProxyWithCreate3;
    upgradeProxy: typeof upgrades.upgradeProxy;
};


export const create3Upgrades: Create3Upgrades = {
    deployProxy: deployProxyWithCreate3,
    upgradeProxy: upgrades.upgradeProxy
};

