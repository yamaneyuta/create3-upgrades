import { ContractFactory, Contract } from "ethers";
import { Create3Upgradeable } from "../typechain-types";
type Options = {
    initializer?: string | false | undefined;
};
/**
 * Create3コントラクトのdeploy関数を使ってコントラクトをデプロイします。
 *
 * ※デプロイするコントラクトのinitialize関数内で_msgSender()やmsg.senderを呼び出した場合、そのアドレスはCreate3コントラクトのアドレスになります。
 *   回避方法:
 *   - initialize関数の引数にアドレスを渡す(推奨)
 *   - `tx.origin`を使用する(非推奨)
 */
export declare const deployProxyWithCreate3: (create3: Create3Upgradeable, salt: string, logicFactory: ContractFactory, args: unknown[], opt?: Options) => Promise<Contract>;
export {};
