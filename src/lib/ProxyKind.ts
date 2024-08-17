import hre from "hardhat";
import { deployProxyImpl } from "@openzeppelin/hardhat-upgrades/dist/utils";
import { ContractFactory } from "ethers";

export class ProxyKind {
    public static async get(implFactory: ContractFactory) {
        const { kind } = await deployProxyImpl(hre, implFactory, {});
        return kind;
    }
}
