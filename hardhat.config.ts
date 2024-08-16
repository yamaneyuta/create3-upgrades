import path from "node:path";
import { glob } from "glob";
import { task, HardhatUserConfig } from "hardhat/config";
import { TASK_TEST_GET_TEST_FILES } from "hardhat/builtin-tasks/task-names";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-toolbox";

task(TASK_TEST_GET_TEST_FILES, async ({ testFiles }) => {
    // 各ディレクトリ内の`.test.ts`ファイルをテスト対象とする
    return ["contracts", "src", "test"].map(
        dir => glob.sync(`${dir}/**/*.test.ts`).map(
            f => path.join(process.cwd(), f)  // 絶対パスに変換
        )
    ).flat();   // 2次元配列を1次元配列に変換
});

const config: HardhatUserConfig = {
    solidity: "0.8.24",
};

export default config;
