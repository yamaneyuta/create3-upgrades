import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, EventFragment, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedLogDescription, TypedListener, TypedContractMethod } from "../common";
export interface Create3UpgradeableInterface extends Interface {
    getFunction(nameOrSignature: "deploy" | "getDeployed"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "Deployed" | "Initialized"): EventFragment;
    encodeFunctionData(functionFragment: "deploy", values: [BytesLike, BytesLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getDeployed", values: [BytesLike]): string;
    decodeFunctionResult(functionFragment: "deploy", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getDeployed", data: BytesLike): Result;
}
export declare namespace DeployedEvent {
    type InputTuple = [
        account: AddressLike,
        salt: BytesLike,
        deployed: AddressLike
    ];
    type OutputTuple = [account: string, salt: string, deployed: string];
    interface OutputObject {
        account: string;
        salt: string;
        deployed: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace InitializedEvent {
    type InputTuple = [version: BigNumberish];
    type OutputTuple = [version: bigint];
    interface OutputObject {
        version: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export interface Create3Upgradeable extends BaseContract {
    connect(runner?: ContractRunner | null): Create3Upgradeable;
    waitForDeployment(): Promise<this>;
    interface: Create3UpgradeableInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    deploy: TypedContractMethod<[
        salt: BytesLike,
        creationCode: BytesLike,
        value: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getDeployed: TypedContractMethod<[salt: BytesLike], [string], "view">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "deploy"): TypedContractMethod<[
        salt: BytesLike,
        creationCode: BytesLike,
        value: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "getDeployed"): TypedContractMethod<[salt: BytesLike], [string], "view">;
    getEvent(key: "Deployed"): TypedContractEvent<DeployedEvent.InputTuple, DeployedEvent.OutputTuple, DeployedEvent.OutputObject>;
    getEvent(key: "Initialized"): TypedContractEvent<InitializedEvent.InputTuple, InitializedEvent.OutputTuple, InitializedEvent.OutputObject>;
    filters: {
        "Deployed(address,bytes32,address)": TypedContractEvent<DeployedEvent.InputTuple, DeployedEvent.OutputTuple, DeployedEvent.OutputObject>;
        Deployed: TypedContractEvent<DeployedEvent.InputTuple, DeployedEvent.OutputTuple, DeployedEvent.OutputObject>;
        "Initialized(uint64)": TypedContractEvent<InitializedEvent.InputTuple, InitializedEvent.OutputTuple, InitializedEvent.OutputObject>;
        Initialized: TypedContractEvent<InitializedEvent.InputTuple, InitializedEvent.OutputTuple, InitializedEvent.OutputObject>;
    };
}
