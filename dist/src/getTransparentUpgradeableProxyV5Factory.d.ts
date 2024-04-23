import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Signer } from "ethers";
/**
 * @openzeppelin-upgrades v5のTransparentUpgradeableProxyFactoryを取得します。
 *
 * `getTransparentUpgradeableProxyFactory`の代わりに使用します。
 */
export declare const getTransparentUpgradeableProxyV5Factory: (hre: HardhatRuntimeEnvironment, signer?: Signer) => Promise<import("ethers").ContractFactory<any[], import("ethers").BaseContract>>;
