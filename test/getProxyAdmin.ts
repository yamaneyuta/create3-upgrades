import hre ,{ ethers } from "hardhat";
import { ContractRunner, EventLog } from "ethers";
import { Manifest } from "@openzeppelin/upgrades-core";

import TransparentUpgradeableProxyMeta from "@openzeppelin/contracts/build/contracts/TransparentUpgradeableProxy.json";
import ProxyAdminMeta from "@openzeppelin/contracts/build/contracts/ProxyAdmin.json";
import { ProxyAdmin } from "../typechain-types";

export const getProxyAdmin = async(proxyAddress: string, runner?: ContractRunner | null | undefined) => {

    // ProxyAdminのアドレスを取得
    const proxyAdminAddress = await getProxyAdminAddress(proxyAddress);

    // コントラクトオブジェクトを返す
    return new ethers.Contract(proxyAdminAddress, ProxyAdminMeta.abi, runner) as unknown as ProxyAdmin;
};


/**
 * デプロイ済みの`TransparentUpgradeableProxy`コントラクトアドレスから、そのコントラクトのProxyAdminコントラクトアドレスを取得します。
 */
const getProxyAdminAddress = async(proxyAddress: string) => {

    // マニフェストからデプロイ時のトランザクションハッシュを取得1
    const manifest = await Manifest.forNetwork(hre.network.provider);
    const { txHash } = await manifest.getProxyFromAddress(proxyAddress);

    if(!txHash) {
        throw new Error(`[AA16A4AC] Proxy contract not found. (${proxyAddress})`);
    }

    // デプロイ時のブロック番号を取得
    const txReceipt = await ethers.provider.getTransactionReceipt(txHash);
    if(!txReceipt) {
        throw new Error(`[9F84D8C5] Transaction receipt not found. (${txHash})`);
    }
    const blockNumber = txReceipt.blockNumber;

    // デプロイ時のAdminChangedイベントを取得
    const proxyFactory = new ethers.ContractFactory(TransparentUpgradeableProxyMeta.abi, TransparentUpgradeableProxyMeta.bytecode, ethers.provider);
    const proxyContract = new ethers.Contract(proxyAddress, proxyFactory.interface, ethers.provider);
    const filter = proxyContract.filters.AdminChanged();
    const events = (await proxyContract.queryFilter(filter, blockNumber, blockNumber)).filter(e=>e.transactionHash === txHash);
    if(events.length !== 1) {
        throw new Error(`[46CECD15] Invalid AdminChanged event. (${proxyAddress})`);
    }

    // イベントから、新しいAdmin(＝ProxyAdmin)のアドレスを取得
    const [ previousAdmin, newAdmin ] = (events[0] as EventLog).args;

    return newAdmin;
};