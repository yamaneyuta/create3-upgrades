"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployProxyWithCreate3 = void 0;
const hardhat_1 = __importStar(require("hardhat"));
const utils_1 = require("@openzeppelin/hardhat-upgrades/dist/utils");
const manifest_1 = require("@openzeppelin/upgrades-core/dist/manifest");
const getTransparentUpgradeableProxyV5Factory_1 = require("./getTransparentUpgradeableProxyV5Factory");
/**
 * Create3コントラクトのdeploy関数を使ってコントラクトをデプロイします。
 *
 * ※デプロイするコントラクトのinitialize関数内で_msgSender()やmsg.senderを呼び出した場合、そのアドレスはCreate3コントラクトのアドレスになります。
 *   回避方法:
 *   - initialize関数の引数にアドレスを渡す(推奨)
 *   - `tx.origin`を使用する(非推奨)
 */
const deployProxyWithCreate3 = async (create3, salt, logicFactory, args, opt) => {
    // TODO: 事前チェック
    // - argsの数
    // - TransparentUpgradeableProxyのコンストラクタの引数の数及び型
    logicFactory.interface.fragments;
    // 実装コントラクトをデプロイ
    const { contract: logicContract } = await deployLogicContract(logicFactory);
    // Create3コントラクトを使ってTransparentUpgradeableProxyをデプロイ
    // ※TransparentUpgradeableProxyデプロイ時に実装コントラクトへの参照及びinitialize関数呼び出しが実行される
    const contract = await deployTransparentUpgradeableProxy(create3, salt, logicContract, logicFactory, args, opt);
    return contract;
};
exports.deployProxyWithCreate3 = deployProxyWithCreate3;
/**
 * 実装コントラクトをデプロイします。
 */
const deployLogicContract = async (logicFactory) => {
    // 実装コントラクトをデプロイ。
    // `deployProxyImpl`を使ってデプロイすることでManifestに実装コントラクトの情報が登録されます。
    // ※Manifestの場所:
    //   - hardhat: `/tmp/openzeppelin-upgrades`
    //   - その他: `.openzeppelin`
    const { impl, kind, txResponse } = await (0, utils_1.deployProxyImpl)(hardhat_1.default, logicFactory, {});
    return {
        contract: new hardhat_1.ethers.Contract(impl, logicFactory.interface, await getDeployer()),
        txResponse
    };
};
/**
 * `TransparentUpgradeableProxy`コントラクトをCreate3コントラクトを使ってデプロイします。
 * @param create3
 */
const deployTransparentUpgradeableProxy = async (create3, salt, logic, logicFactory, args, opt) => {
    const deployer = await getDeployer();
    // initialize関数の引数をデータに変換
    const initializeData = (0, utils_1.getInitializerData)(logicFactory.interface, args, opt?.initializer);
    // TransparentUpgradeableProxyのコンストラクタの引数の型を取得
    // TransparentUpgradeableProxy(v5)のコンストラクタ ⇒ (address _logic, address initialOwner, bytes memory _data)
    const pramTypes = await getProxyConstructorParamTypes();
    // TransparentUpgradeableProxyのコンストラクタの引数
    const logicAddress = await logic.getAddress();
    const initialOwner = await deployer.getAddress();
    const proxyArgs = [logicAddress, initialOwner, initializeData];
    // Create3でデプロイするためのバイトコードを生成
    const proxyFactory = await (0, getTransparentUpgradeableProxyV5Factory_1.getTransparentUpgradeableProxyV5Factory)(hardhat_1.default, deployer);
    const creationCode = hardhat_1.ethers.solidityPacked(["bytes", "bytes"], [
        proxyFactory.bytecode,
        hardhat_1.ethers.AbiCoder.defaultAbiCoder().encode(pramTypes, proxyArgs)
    ]);
    const txResponse = await create3.deploy(salt, creationCode, 0);
    const txReceipt = await txResponse.wait();
    if (txReceipt === null) {
        throw new Error("[55E78FCF] Failed to deploy TransparentUpgradeableProxy");
    }
    // Deployedイベントを取得
    const { blockNumber, hash: txHash } = txReceipt;
    const deployAccountAddress = await deployer.getAddress();
    const filter = create3.filters.Deployed(deployAccountAddress, salt);
    const events = (await create3.queryFilter(filter, blockNumber, blockNumber)).filter(e => e.transactionHash === txHash);
    // Deployedイベントから、実際にデプロイしたコントラクトアドレスを取得する。
    // コントラクトアドレスはDeployedイベントの第三引数のため、インデックスが3の値(topics[3])を取得する。(インデックス0はイベント識別用ハッシュ値)
    // ここで取得できる値は、256bit長の文字列であることに注意。(例: `0x0000000000000000000000001ba887f85ec02cf3b979b8b31fa06b3fac21ded4`)
    //
    // 256bit長の文字列を160bit長に変換したものをアドレスとして使用
    const proxyAddress = hardhat_1.ethers.getAddress(events[0].topics[3].replace("0x000000000000000000000000", "0x"));
    // ManifestにProxy情報を登録
    // ⇒ OpenZeppelinの`upgrades.updateProxy`を呼び出し可能にするためには、ManifestにProxy情報を登録する必要がある。
    const manifest = await manifest_1.Manifest.forNetwork(hardhat_1.default.network.provider);
    await manifest.addProxy({
        address: proxyAddress,
        kind: "transparent",
        txHash: txHash
    });
    return new hardhat_1.ethers.Contract(proxyAddress, logicFactory.interface, deployer);
};
const getProxyConstructorParamTypes = async () => {
    const proxyFactory = await (0, getTransparentUpgradeableProxyV5Factory_1.getTransparentUpgradeableProxyV5Factory)(hardhat_1.default, await getDeployer());
    const pramTypes = proxyFactory.interface.fragments.filter(f => f.type === "constructor")[0].inputs.map(i => i.type);
    if (pramTypes === undefined) {
        console.log("proxyFactory.interface: ", JSON.stringify(proxyFactory.interface, null, "\t"));
        throw new Error("[D097833F] Failed to get pramTypes");
    }
    return pramTypes;
};
const getDeployer = async () => {
    return await hardhat_1.ethers.provider.getSigner();
};
