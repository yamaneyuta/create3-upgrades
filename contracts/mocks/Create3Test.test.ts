import assert from "node:assert/strict";
import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { Privatenet } from "../../test/lib/Privatenet";
import { Salt } from "../../test/lib/Salt";

describe("[2E4BF335] Deploy with Create3", () => {
    const deployFixture = async () => {
        await Privatenet.reset(); // ネットワークのリセット(nonceを0に戻すため)

        const factory = await ethers.getContractFactory("Create3Test");
        const create3 = await upgrades.deployProxy(factory, []);

        return { create3 };
    };

    /**
     * Create3コントラクトのデプロイに関するテスト
     * デプロイされるCreate3コントラクトのアドレスが固定の値であることを確認します。
     */
    it("[5490E73C] deploy", async () => {
        const { create3 } = await loadFixture(deployFixture);

        const { deployer } = await Privatenet.signers();
        const provider = await Privatenet.provider();
        const deployerAddress = await deployer.getAddress();

        // 実装コントラクトとProxyコントラクトの2つがデプロイされているため、nonceは2
        // ※ProxyAdminはProxyコントラクトデプロイ時と同一トランザクションで行われるため、nonceのカウントには含まれない
        const nonce = await provider.getTransactionCount(deployerAddress);
        assert(nonce === 2, `[A5E3FE63] nonce: ${nonce}`);

        // create3のアドレスはnonceが1の時にデプロイされるProxyコントラクトのアドレス
        // (nonceが0のタイミングでデプロイされるのは実装コントラクト)
        const expectedAddress = ethers.getCreateAddress({
            from: deployerAddress,
            nonce: 1,
        });
        const create3Address = await create3.getAddress();

        expect(create3Address).to.be.eq(expectedAddress);
        expect(create3Address).to.be.eq("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
    });

    /**
     * デプロイ済みのコントラクトのコードハッシュを確認します。
     * 2024/8/16時点でのデプロイされたコントラクトのバイトコードのハッシュ値等を確認します。
     * ライブラリのバージョンアップ等でバイトコードが変更された時にはこのテストが失敗するので、影響がないかどうかを確認してください。
     */
    it("[CC9F505F] deployed code", async () => {
        await loadFixture(deployFixture);

        const { deployer } = await Privatenet.signers();
        const provider = await Privatenet.provider();
        const deployerAddress = await deployer.getAddress();

        const implAddress = ethers.getCreateAddress({
            from: deployerAddress,
            nonce: 0,
        }); // 実装コントラクト(Create3Test)のアドレス
        const proxyAddress = ethers.getCreateAddress({
            from: deployerAddress,
            nonce: 1,
        }); // Proxyコントラクトのアドレス

        // Create3Testのバイトコードチェックのため、Create3コントラクト自体はテストしていないことに注意。
        const impleCode = await provider.getCode(implAddress);
        expect(impleCode.length).to.be.greaterThan(0); // 実装コントラクトがデプロイされていること

        // proxyCodeはopenzeppelinのProxyコントラクトなので、Create3とは直接関係ないことに注意。
        const proxyCode = await provider.getCode(proxyAddress);
        expect(proxyCode.length).to.be.greaterThan(0); // Proxyコントラクトがデプロイされていること
    });

    it("[CEAE2166] getDeployed()", async () => {
        let { create3 } = await loadFixture(deployFixture);

        const { alice } = await Privatenet.signers();
        const salt = Salt.create("hello");

        const address: string = await create3.getDeployed(salt);

        // deployerがnonce0の時にデプロイした時のCreate3コントラクト(実際はnonce1のProxyコントラクト)を用いて
        // saltが"hello"の時のアドレスを取得する
        expect(address).to.be.equal("0xb3E11c333711371378c5A225EE2E3542c1eE2b61");

        // aliceでgetDeployedを実行しても同じアドレスが取得できることを確認
        // ※別のウォレットでデプロイしても同じアドレスが取得できることは運用上好ましくない場合もあるため注意。
        create3 = create3.connect(alice) as typeof create3;
        const address2: string = await create3.getDeployed(salt);
        expect(address).to.be.equal(address2);
        expect(address2).to.be.equal("0xb3E11c333711371378c5A225EE2E3542c1eE2b61");
    });
});
