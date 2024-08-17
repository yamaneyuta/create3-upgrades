import { ethers } from "ethers";

export class Salt {
    public static create(text: string): string {
        return ethers.keccak256(ethers.toUtf8Bytes(text));
    }
}
