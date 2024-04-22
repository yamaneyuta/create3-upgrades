import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployUpgradableCreate3 } from "../src/deployUpgradableCreate3";
import { Create3 } from "../typechain-types";

// テスト時のデプロイアカウント
// ⇒ mnemonic: "test test test test test test test test test test test junk"
// const DEPLOYER_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

// Create3(実装)がデプロイされる時のnonce
const CREATE3_IMPL_DEPLOYED_NONCE = 0;
// Create3(Proxy)がデプロイされる時のnonce
const CREATE3_PROXY_DEPLOYED_NONCE = CREATE3_IMPL_DEPLOYED_NONCE + 1;

// Create3をデプロイする関数。
const deployCreate3 = async () => {
    const deployer = await ethers.provider.getSigner();

    // Create3をデプロイ
    const create3 = await deployUpgradableCreate3();

    // Create3の実装コントラクトも取得しておく
    const create3ImplAddress = ethers.getCreateAddress({ from: deployer.address, nonce: CREATE3_IMPL_DEPLOYED_NONCE } );
    let create3Impl = new ethers.Contract(create3ImplAddress, create3.interface, ethers.provider) as unknown as Create3;
    create3Impl = create3Impl.connect(deployer);

    return { deployer, create3, create3Impl };
};


describe("Create3", ()=>{

    // Create3コントラクトアドレスが期待通りにデプロイされるか確認
    it("[C41AA56A] Check create3 address", async ()=>{
        const { deployer, create3 } = await loadFixture(deployCreate3);
        // デプロイされたCreate3のアドレスを取得
        const address = await create3.getAddress();

        // Create3のアドレスはProxyのアドレス。
        // Proxyのアドレスをnonceから計算し、一致するかどうかを確認する。
        const expectedAddress = ethers.getCreateAddress({ from: deployer.address, nonce: CREATE3_PROXY_DEPLOYED_NONCE });

        // アドレスが期待通りか確認
        expect(expectedAddress).equals(address);
    });


    // Create3のownerがデプロイアカウントと一致するか確認
    it("[085DBE09] Check create3 owner", async ()=>{
        const { deployer, create3 } = await loadFixture(deployCreate3);
        const owner = await create3.owner();
        expect(deployer.address).equals(owner);
    });

    // Initializeイベントの値は1であることを確認
    it("[61A53478] Check create3 initialize event", async ()=>{
        const { create3 } = await loadFixture(deployCreate3);

        const events = create3.filters["Initialized"]();
        const logs = await create3.queryFilter(events);

        // Initializeイベントは1回だけ発生
        expect(1).equals(logs.length);

        const log = logs[0];
        const version = log.args[0];   // Initializedイベントの引数

        expect(1).equals(version);
    });
});


describe("Create3Impl", ()=>{

    // Create3の実装コントラクトのownerが設定されていないことを確認
    it("[26AD5792] Check create3 implementation owner", async ()=>{
        const { create3Impl } = await loadFixture(deployCreate3);
        
        const owner = await create3Impl.owner();
        expect(ethers.ZeroAddress).equals(owner);
    });


    // Initializeイベントでuint64の最大値が設定されていることを確認
    it("[8CAA7419] Check create3 implementation initialize event", async ()=>{
        const { create3Impl } = await loadFixture(deployCreate3);

        const events = create3Impl.filters["Initialized"]();
        const logs = await create3Impl.queryFilter(events);
        
        // Initializeイベントは1回だけ発生
        expect(1).equals(logs.length);

        const log = logs[0];
        const version = log.args[0];   // Initializedイベントの引数

        const uint64Max = BigInt("0xffffffffffffffff");

        expect(uint64Max).equals(version);
    });


    // Create3の実装コントラクトのinitialize関数が呼び出せないことを確認
    it("[6F19755E] Check create3 implementation initialize function", async ()=>{
        const { create3Impl } = await loadFixture(deployCreate3);

        // initialize関数を呼び出すと例外が発生することを確認
        let error: any = null;
        try {
            await create3Impl.initialize({ gasLimit: 1000000 });
        } catch(e) {
            error = e;
        }

        // 例外が発生していることを確認
        expect(error).not.null;
        // e.messageに`InvalidInitialization`が含まれることを確認
        expect(error.message).contains("InvalidInitialization");
    });
});