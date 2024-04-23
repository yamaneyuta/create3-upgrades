"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransparentUpgradeableProxyV5Factory = void 0;
const utils_1 = require("@openzeppelin/hardhat-upgrades/dist/utils");
const crypto_1 = __importDefault(require("crypto"));
// @openzeppelin-upgrades v5におけるTransparentUpgradeableProxyのbytecode長及びsha256ハッシュ値
const TRANSPARENT_UPGRADABLE_PROXY_V5_BYTECODE_LENGTH = 7524;
const TRANSPARENT_UPGRADABLE_PROXY_V5_BYTECODE_SHA256 = "d74af98b487f837f53fb602dd5d3850e66ccbdfa5d3f43f882f1e4126249231c";
/**
 * @openzeppelin-upgrades v5のTransparentUpgradeableProxyFactoryを取得します。
 *
 * `getTransparentUpgradeableProxyFactory`の代わりに使用します。
 */
const getTransparentUpgradeableProxyV5Factory = async (hre, signer) => {
    const factory = await (0, utils_1.getTransparentUpgradeableProxyFactory)(hre, signer);
    // v5のTransparentUpgradeableProxyFactoryかどうかを検証してから返す
    verifyTransparentUpgradeableProxyFactory(factory);
    return factory;
};
exports.getTransparentUpgradeableProxyV5Factory = getTransparentUpgradeableProxyV5Factory;
/**
 * 指定されたContractFactoryが、@openzeppelin/contracts-upgradeable v5のTransparentUpgradeableProxyFactoryかどうかを検証します。
 * @param factory
 */
const verifyTransparentUpgradeableProxyFactory = (factory) => {
    let verified = true;
    // バイトコードの長さが異なる場合
    if (TRANSPARENT_UPGRADABLE_PROXY_V5_BYTECODE_LENGTH !== factory.bytecode.length) {
        console.error("Expected bytecode length: ", TRANSPARENT_UPGRADABLE_PROXY_V5_BYTECODE_LENGTH, " but got: ", factory.bytecode.length);
        verified = false;
    }
    // バイトコードのハッシュ値が異なる場合
    if (TRANSPARENT_UPGRADABLE_PROXY_V5_BYTECODE_SHA256 !== sha256(factory.bytecode)) {
        console.error("Expected bytecode hash: ", TRANSPARENT_UPGRADABLE_PROXY_V5_BYTECODE_SHA256, " but got: ", sha256(factory.bytecode));
        verified = false;
    }
    // 検証失敗時は例外をスロー    
    if (verified === false) {
        throw new Error("The specified factory is not a TransparentUpgradeableProxyFactory(v5).");
    }
};
const sha256 = (message) => {
    return crypto_1.default.createHash('sha256').update(message).digest('hex');
};
