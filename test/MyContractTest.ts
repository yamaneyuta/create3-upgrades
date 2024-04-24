import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { Create3Mock, MyContractEx1Mock, MyContractMock } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

import { create3Upgrades } from "../src/index";

// `MyContractMock`をデプロイするときに用いるsalt。
// ※ `MyContractMock`という文字列である必要はない。
const SALT = ethers.encodeBytes32String("MyContractMock");

// MyContractMockのinitialize関数を呼び出す際の引数
const INIT_FOO_VAL: bigint = 123n;
const INIT_BAR_VAL: bigint = 456n;

// MyContractEx1Mockのinitialize関数を呼び出す際の引数
const INIT_BAZ_VAL: bigint = 789n;

// Create3コントラクトとMyContractMockをデプロイ
const initContracts = async() => {
    const deployer = await ethers.provider.getSigner();

    // Create3コントラクトをデプロイ
    const create3Factory = await ethers.getContractFactory("Create3Mock");
    const create3Args = [] as unknown[];
    const create3: Create3Mock = await (await upgrades.deployProxy(create3Factory, create3Args)).waitForDeployment() as unknown as Create3Mock;
    // デプロイ完了まで待機
    await create3.waitForDeployment();

    // Create3コントラクトを用いてMyContractMockをデプロイ
    const myContractFactory = await ethers.getContractFactory("MyContractMock");
    // MyContractMockのinitialize関数の引数
    const myContractArgs = [
        await deployer.getAddress(),
        INIT_FOO_VAL,
        INIT_BAR_VAL
    ] as unknown[];

    const create3Address = await create3.getAddress();

    // デプロイ
    const myContract = await create3Upgrades.deployProxy(create3Address, SALT, myContractFactory, myContractArgs) as unknown as MyContractMock;
    // デプロイ完了まで待機
    await myContract.waitForDeployment();

    return { deployer, create3, myContract };
};


// MyContractMockをMyContractEx1Mockにアップグレード
const upgradeToMyContractEx1 = async ()=> {
    const { deployer, create3, myContract } = await initContracts();

    const myContractEx1Factory = await ethers.getContractFactory("MyContractEx1Mock");

    const myContractEx1 = await create3Upgrades.upgradeProxy(await myContract.getAddress(), myContractEx1Factory, {
        call: { fn: "initialize(uint256)", args: [INIT_BAZ_VAL] }
    }) as unknown as MyContractEx1Mock;

    return { create3, myContractEx1 };
};

describe("[E28AD783] Deploy with Create3", ()=>{

    // デプロイ時のinitialize関数の引数が正しく設定されているか確認
    it("[D612750B] Deploy MyContract", async()=>{
        const { myContract } = await loadFixture(initContracts);

        const fooVal = await myContract.foo();
        expect(INIT_FOO_VAL).equal(fooVal);

        const barVal = await myContract.bar();
        expect(INIT_BAR_VAL).equal(barVal);
    });


    // デプロイされたMyContractのアドレスがCreate3で計算されたアドレスと一致するかどうかを確認
    it("[788D8E38] Check MyContract address", async()=>{
        const { create3, myContract } = await loadFixture(initContracts);

        const expectAddress = await create3.getDeployed(SALT);
        const myContractAddress = await myContract.getAddress();

        expect(expectAddress).equal(myContractAddress);
    });


    // MyContractMockをMyContractEx1Mockにアップグレード
    it("[7A9DD898] Upgrade MyContract to MyContractEx1", async()=>{
        const { myContractEx1 } = await loadFixture(upgradeToMyContractEx1);

        const fooVal = await myContractEx1.foo();
        expect(INIT_FOO_VAL).equal(fooVal);

        const barVal = await myContractEx1.bar();
        expect(INIT_BAR_VAL).equal(barVal);

        const bazVal = await myContractEx1.baz();
        expect(INIT_BAZ_VAL).equal(bazVal);
    });


    // MyContractEx1にアップグレードしてもコントラクトアドレスは変わらないことを確認
    it("[C09CB79B] Check MyContractEx1 address", async()=>{
        const { create3, myContractEx1 } = await loadFixture(upgradeToMyContractEx1);

        const expectAddress = await create3.getDeployed(SALT);
        const myContractEx1Address = await myContractEx1.getAddress();

        expect(expectAddress).equal(myContractEx1Address);
    });

});
