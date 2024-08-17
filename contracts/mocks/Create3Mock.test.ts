import assert from "node:assert/strict";
import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { Privatenet } from "../../test/lib/Privatenet";
import { md5 } from "../../test/lib/md5";

describe("[2E4BF335] Deploy with Create3", () => {
    const deployFixture = async () => {
        await Privatenet.reset(); // ネットワークのリセット(nonceを0に戻すため)

        const factory = await ethers.getContractFactory("Create3Mock");
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
        const { create3 } = await loadFixture(deployFixture);

        const { deployer } = await Privatenet.signers();
        const provider = await Privatenet.provider();
        const deployerAddress = await deployer.getAddress();

        const implAddress = ethers.getCreateAddress({
            from: deployerAddress,
            nonce: 0,
        }); // 実装コントラクト(Create3Mock)のアドレス
        const proxyAddress = ethers.getCreateAddress({
            from: deployerAddress,
            nonce: 1,
        }); // Proxyコントラクトのアドレス

        // Create3Mockのバイトコードチェックのため、Create3コントラクト自体はテストしていないことに注意。
        const impleCode = await provider.getCode(implAddress);
        expect(impleCode.length).to.be.equal(5796);
        expect(md5(impleCode)).to.be.equal("a220ec80c69f17d685f34671c95dd52e");

        // proxyCodeはopenzeppelinのProxyコントラクトなので、Create3とは直接関係ないことに注意。
        const proxyCode = await provider.getCode(proxyAddress);
        expect(proxyCode.length).to.be.equal(2320);
        expect(md5(proxyCode)).to.be.equal("639b4e3e55aec99ba6dd1df01f8031d7");
    });
});
