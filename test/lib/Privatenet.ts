import assert from "node:assert/strict";
import { ethers, network } from "hardhat";
import { Signer } from "ethers";

export class Privatenet {
    /**
     * テスト用アカウントを取得します。
     */
    public static async signers() {
        const signers: Signer[] = await ethers.getSigners();
        assert(signers.length === 20, "[69F5DE0B] signers.length: " + signers.length);

        // 先頭から、コントラクトをデプロイするアカウント、alice, bob, という順番で割り当てる
        // テスト用アカウントが不足した場合はこの配列の後ろに追加すること。
        // ※ alice、bobという名称を用いているが、(本テストにおいて)これらのアカウント利用は暗号通信に制限されるわけではない。
        const [deployer, alice, bob] = signers;
        // 一番最後をzoeとして割り当てる
        const zoe = signers[signers.length - 1];

        return { deployer, alice, bob, zoe };
    }

    /**
     * プライベートネットに接続するプロバイダを取得します。
     */
    public static async provider() {
        const signers: Signer[] = await ethers.getSigners();
        return signers[0].provider!;
    }

    /**
     * 接続中のチェーンがHardhatのノードかどうかを返します。
     */
    public static isHardhatNode(): boolean {
        return network.name === "hardhat";
    }

    /**
     * Hardhatノードの初期化を行います。
     */
    public static async reset() {
        assert(this.isHardhatNode(), "[30042396] Not connected to Hardhat network");

        const ret = (await network.provider.request({
            method: "hardhat_reset",
            params: [],
        })) as boolean;

        assert(ret, "[DD67CBDC] Failed to reset network");
    }
}
