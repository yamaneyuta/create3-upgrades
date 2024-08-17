import { expect } from "chai";
import { md5 } from "./md5";

describe("[779F5B23] md5", () => {
    it("[CDD76F20] md5", async () => {
        const hash = md5("hello");

        // helloのMD5ハッシュ値を確認
        expect(hash, "5d41402abc4b2a76b9719d911017c592");
    });
});
