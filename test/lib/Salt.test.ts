import { expect } from "chai";
import { Salt } from "./Salt";

describe("[68B6FFD4] Salt", () => {
    it("[D48FB311] create", async () => {
        const hash = Salt.create("hello");

        // saltは32バイトのハッシュ値
        expect(hash.length).to.equal(2 + 32 * 2); // 0x + 32byte * 2
    });
});
