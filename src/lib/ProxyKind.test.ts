import { ethers } from "hardhat";
import { expect } from "chai";
import { ProxyKind } from "./ProxyKind";

describe("[57BC93DE] ProxyKind", () => {
    it("[8728FEDF] get() - transparent", async () => {
        const factory = await ethers.getContractFactory("Create3Mock");
        const kind = await ProxyKind.get(factory);

        // `UUPSUpgradeable`を継承していないため、transparent proxyとなる
        expect(kind).to.equal("transparent");
    });

    it("[8728FEDF] get() - uups", async () => {
        const factory = await ethers.getContractFactory("Create3UUPSMock");
        const kind = await ProxyKind.get(factory);

        // `UUPSUpgradeable`を継承しているため、uups proxyとなる
        expect(kind).to.equal("uups");
    });
});
