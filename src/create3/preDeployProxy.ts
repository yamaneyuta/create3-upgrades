import hre from "hardhat";
import { ContractFactory } from "ethers";
import { Options } from "../types/Options";
import { getTransparentUpgradeableProxyFactory } from "@openzeppelin/hardhat-upgrades/dist/utils";

/**
 * Create3コントラクトのdeploy関数を使ってコントラクトをデプロイする前にユーザーからの入力等をチェックします。
 */
export const preDeployProxy = async(create3: string, salt: string, logicFactory: ContractFactory, args: unknown[], opt?: Options) => {
    // 与えられたsaltのフォーマットをチェック
    verifySaltFormat(salt);

    // initialize関数呼び出し時の引数の数をチェック
    verifyInitializeArgs(logicFactory, args, opt);

    // getTransparentUpgradeableProxyFactory関数で取得できるContractFactoryをチェック
    const factory = await getTransparentUpgradeableProxyFactory(hre);
    verifyTransparentUpgradeableProxyFactory(factory);
};

/**
 * saltのフォーマットをチェックします。
 * @param salt 
 */
const verifySaltFormat = (salt: string) => {
    // saltはbyte32をhex表記したもの
    if(!salt.match(/^0x[0-9a-fA-F]{64}$/)) {
        throw new Error(`[455C0EB8] Invalid salt format (${salt}). Use ethers.encodeBytes32String() to encode string to bytes32.`);
    }
}

/**
 * デプロイするコントラクトのinitialize関数の引数をチェックします。
 * @param logicFactory 
 * @param args 
 * @param opt 
 * @returns 
 */
const verifyInitializeArgs = (logicFactory: ContractFactory, args: unknown[], opt?: Options) => {
    let initializer = opt?.initializer;

    // initializerがfalseの場合はinitialize関数を呼び出さない
    if(initializer === false) {
        // initialize関数を呼び出さない時、argsは空配列を期待している
        if(args.length !== 0) {
            throw new Error(`[0F9F3281] Invalid args. args must be empty array when initializer is false. expected: [], actual: ${args}`);
        }

        // 以降のチェックは不要
        return;
    }

    // initializerが指定されていない場合は既定でinitialize関数を呼び出す動作となる
    initializer = initializer ?? "initialize";

    const fragment = logicFactory.interface.getFunction(initializer);
    if(!fragment) {
        // initializerとなる関数が存在しない場合はエラー
        throw new Error(`[43BBAF75] Invalid initializer. ${initializer} is not found in the contract.`);
    }

    if(fragment.inputs.length !== args.length) {
        // 引数の数が一致しない場合はエラー
        throw new Error(`[20AFEDBC] Invalid args. The number of arguments does not match the number of inputs of the initializer. expected: ${fragment.inputs.length}, actual: ${args.length}`);
    }
} 


const verifyTransparentUpgradeableProxyFactory = (factory: ContractFactory) => {
    // TransparentUpgradeableProxyの動作がv4からv5で大きく変更されている。
    // 今後、TransparentUpgradeableProxyが更新された場合に気づくことができるようにチェック処理を実施。
    //
    // コンストラクタの引数の名前、型が一致しているかどうかをチェック。
    // バイナリが変更されていても上記が一致している場合は問題ないものとして扱う。


    // コンストラクタの情報を取得
    const constructorFragments = factory.interface.fragments.filter(f=>f.type === "constructor")[0];

    // コンストラクタの引数の名前一覧を取得
    const constructorArgNames = constructorFragments.inputs.map(i=>i.name);
    const expectConstructorArgNames = ["_logic", "initialOwner", "_data"];

    if(JSON.stringify(constructorArgNames) !== JSON.stringify(expectConstructorArgNames)) {
        // コンストラクタの引数の名前が変更されている場合はエラー
        console.error(JSON.stringify(constructorArgNames));
        throw new Error("[D997A4A2] Expected constructor arguments are not found.");
    }


    // コンストラクタの引数の型一覧を取得
    const constructorArgTypes = constructorFragments.inputs.map(i=>i.type);
    const expectConstructorArgTypes = ["address", "address", "bytes"];
    
    if(JSON.stringify(constructorArgTypes) !== JSON.stringify(expectConstructorArgTypes)) {
        // コンストラクタの引数の型が変更されている場合はエラー
        console.error(JSON.stringify(constructorArgTypes));
        throw new Error("[402D35AF] Expected constructor argument types are not found.");
    }
}
