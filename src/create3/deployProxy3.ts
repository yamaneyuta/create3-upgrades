import hre, { ethers } from "hardhat";
import { ContractFactory, Contract } from "ethers";
import {
    deployProxyImpl,
    getInitializerData,
    getTransparentUpgradeableProxyFactory,
} from "@openzeppelin/hardhat-upgrades/dist/utils";
import { Manifest } from "@openzeppelin/upgrades-core/dist/manifest";
import { Create3Upgradeable } from "../../typechain-types/contracts/Create3Upgradeable";
import { Create3Upgradeable__factory } from "../../typechain-types/factories/contracts/Create3Upgradeable__factory";
import { Options } from "../types/Options";
import { preDeployProxy } from "./preDeployProxy";

/**
 * Create3コントラクトのdeploy関数を使ってコントラクトをデプロイします。
 *
 * ※デプロイするコントラクトのinitialize関数内で_msgSender()やmsg.senderを呼び出した場合、そのアドレスはCreate3コントラクトのアドレスになります。
 *   回避方法:
 *   - initialize関数の引数にアドレスを渡す(推奨)
 *   - `tx.origin`を使用する(非推奨)
 */
export const deployProxy = async (
    create3: string,
    salt: string,
    logicFactory: ContractFactory,
    args?: unknown[],
    opt?: Options,
) => {
    const deployer = await getDeployer();

    preDeployProxy(create3, salt, logicFactory, args, opt);

    // TODO: 事前チェック
    // - argsの数
    // - TransparentUpgradeableProxyのコンストラクタの引数の数及び型

    // 実装コントラクトをデプロイ
    const { contract: logicContract } = await deployLogicContract(logicFactory);

    // 指定されたCreate3コントラクトアドレスに接続するオブジェクトを生成
    const create3Contract = new ethers.Contract(
        create3,
        Create3Upgradeable__factory.abi,
        deployer,
    ) as unknown as Create3Upgradeable;

    // Create3コントラクトを使ってTransparentUpgradeableProxyをデプロイ
    // ※TransparentUpgradeableProxyデプロイ時に実装コントラクトへの参照及びinitialize関数呼び出しが実行される
    const contract = await deployTransparentUpgradeableProxy(
        create3Contract,
        salt,
        logicContract,
        logicFactory,
        args,
        opt,
    );

    return contract;
};

/**
 * 実装コントラクトをデプロイします。
 */
const deployLogicContract = async (logicFactory: ContractFactory) => {
    // 実装コントラクトをデプロイ。
    // `deployProxyImpl`を使ってデプロイすることでManifestに実装コントラクトの情報が登録されます。
    // ※Manifestの場所:
    //   - hardhat: `/tmp/openzeppelin-upgrades`
    //   - その他: `.openzeppelin`
    const { impl, txResponse } = await deployProxyImpl(hre, logicFactory, {});

    return {
        contract: new ethers.Contract(
            impl,
            logicFactory.interface,
            await getDeployer(),
        ),
        txResponse,
    };
};

/**
 * `TransparentUpgradeableProxy`コントラクトをCreate3コントラクトを使ってデプロイします。
 * @param create3
 */
const deployTransparentUpgradeableProxy = async (
    create3: Create3Upgradeable,
    salt: string,
    logic: Contract,
    logicFactory: ContractFactory,
    args?: unknown[],
    opt?: Options,
) => {
    const deployer = await getDeployer();

    // initialize関数の引数をデータに変換
    const initializeData = getInitializerData(
        logicFactory.interface,
        args ?? [],
        opt?.initializer,
    );

    // TransparentUpgradeableProxyのコンストラクタの引数の型を取得
    // TransparentUpgradeableProxy(v5)のコンストラクタ ⇒ (address _logic, address initialOwner, bytes memory _data)
    const pramTypes: string[] = await getProxyConstructorParamTypes();

    // TransparentUpgradeableProxyのコンストラクタの引数
    const logicAddress: string = await logic.getAddress();
    const initialOwner: string = await deployer.getAddress();
    const proxyArgs = [logicAddress, initialOwner, initializeData];

    // Create3でデプロイするためのバイトコードを生成
    const proxyFactory = await getTransparentUpgradeableProxyFactory(
        hre,
        deployer,
    );
    const creationCode = ethers.solidityPacked(
        ["bytes", "bytes"],
        [
            proxyFactory.bytecode,
            ethers.AbiCoder.defaultAbiCoder().encode(pramTypes, proxyArgs),
        ],
    );

    const txResponse = await create3.deploy(salt, creationCode, 0);
    const txReceipt = await txResponse.wait();
    if (txReceipt === null) {
        throw new Error(
            "[55E78FCF] Failed to deploy TransparentUpgradeableProxy",
        );
    }

    // Deployedイベントを取得
    const { blockNumber, hash: txHash } = txReceipt;
    const deployAccountAddress = await deployer.getAddress();
    const filter = create3.filters.Deployed(deployAccountAddress);
    const events = (
        await create3.queryFilter(filter, blockNumber, blockNumber)
    ).filter((e) => e.transactionHash === txHash);

    // Deployedイベントから、実際にデプロイしたコントラクトアドレスを取得する。
    // コントラクトアドレスはDeployedイベントの第三引数のため、インデックスが3の値(topics[3])を取得する。(インデックス0はイベント識別用ハッシュ値)
    // ここで取得できる値は、256bit長の文字列であることに注意。(例: `0x0000000000000000000000001ba887f85ec02cf3b979b8b31fa06b3fac21ded4`)
    //
    // 256bit長の文字列を160bit長に変換したものをアドレスとして使用
    const proxyAddress = ethers.getAddress(
        events[0].topics[3].replace("0x000000000000000000000000", "0x"),
    );

    // ManifestにProxy情報を登録
    // ⇒ OpenZeppelinの`upgrades.updateProxy`を呼び出し可能にするためには、ManifestにProxy情報を登録する必要がある。
    const manifest = await Manifest.forNetwork(hre.network.provider);
    await manifest.addProxy({
        address: proxyAddress,
        kind: "transparent",
        txHash: txHash,
    });

    return new ethers.Contract(proxyAddress, logicFactory.interface, deployer);
};

const getProxyConstructorParamTypes = async () => {
    const proxyFactory = await getTransparentUpgradeableProxyFactory(
        hre,
        await getDeployer(),
    );
    const pramTypes = proxyFactory.interface.fragments
        .filter((f) => f.type === "constructor")[0]
        .inputs.map((i) => i.type);

    if (pramTypes === undefined) {
        console.log(
            "proxyFactory.interface: ",
            JSON.stringify(proxyFactory.interface, null, "\t"),
        );
        throw new Error("[D097833F] Failed to get pramTypes");
    }

    return pramTypes;
};

const getDeployer = async () => {
    return await ethers.provider.getSigner();
};
