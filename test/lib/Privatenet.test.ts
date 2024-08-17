import { expect } from "chai";
import { ethers } from "hardhat";
import { Privatenet } from "./Privatenet";

describe("[73D05126] Privatenet", () => {
    it("[0C8461CA] isHardhatNode", async () => {
        // テスト時は必ずHardhatノードに接続している
        expect(Privatenet.isHardhatNode()).to.be.equal(true);
    });

    /**
     * Hardhatノードの状態をリセット処理のテスト
     */
    it("[0C8461CA] reset", async () => {
        const sut = Privatenet;

        const { deployer, alice } = await Privatenet.signers();
        const provider = await Privatenet.provider();

        // 適当にトランザクションを発行(deployerからaliceに1eth送金)
        const tx = await deployer.sendTransaction({
            to: alice.getAddress(),
            value: ethers.parseEther("1.0"),
        });
        tx.wait();

        // この時点でブロック番号は0よりも大きい
        let blockNumber = await provider.getBlockNumber();
        expect(blockNumber).to.be.greaterThan(0);

        // リセット
        await sut.reset();

        // リセット後はブロック番号が0に戻る
        blockNumber = await provider.getBlockNumber();
        expect(blockNumber).to.be.eq(0);
    });
});
