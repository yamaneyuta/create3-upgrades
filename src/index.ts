import { upgrades } from "hardhat";
import { deployProxy } from "./create3/deployProxy3";

type Create3Upgrades = {
    deployProxy: typeof deployProxy;
    upgradeProxy: typeof upgrades.upgradeProxy;
};

export const create3Upgrades: Create3Upgrades = {
    deployProxy: deployProxy,
    upgradeProxy: upgrades.upgradeProxy,
};
