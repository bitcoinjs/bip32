/// <reference types="node" />
interface Network {
    wif: number;
    bip32: {
        public: number;
        private: number;
    };
    messagePrefix?: string;
    bech32?: string;
    pubKeyHash?: number;
    scriptHash?: number;
}
export interface BIP32Interface {
    chainCode: Buffer;
    network: Network;
    lowR: boolean;
    depth: number;
    index: number;
    parentFingerprint: number;
    publicKey: Buffer;
    privateKey?: Buffer;
    identifier: Buffer;
    fingerprint: Buffer;
    isNeutered(): boolean;
    neutered(): BIP32Interface;
    toBase58(): string;
    toWIF(): string;
    derive(index: number): BIP32Interface;
    deriveHardened(index: number): BIP32Interface;
    derivePath(path: string): BIP32Interface;
    sign(hash: Buffer, lowR?: boolean): Buffer;
    verify(hash: Buffer, signature: Buffer): boolean;
    signSchnorr(hash: Buffer): Buffer;
    verifySchnorr(hash: Buffer, signature: Buffer): boolean;
}
export interface BIP32API {
    fromSeed(seed: Buffer, network?: Network): BIP32Interface;
    fromBase58(inString: string, network?: Network): BIP32Interface;
    fromPublicKey(publicKey: Buffer, chainCode: Buffer, network?: Network): BIP32Interface;
    fromPrivateKey(privateKey: Buffer, chainCode: Buffer, network?: Network): BIP32Interface;
}
export interface TinySecp256k1Interface {
    isPoint(p: Uint8Array): boolean;
    isPrivate(d: Uint8Array): boolean;
    pointFromScalar(d: Uint8Array, compressed?: boolean): Uint8Array | null;
    pointAddScalar(p: Uint8Array, tweak: Uint8Array, compressed?: boolean): Uint8Array | null;
    privateAdd(d: Uint8Array, tweak: Uint8Array): Uint8Array | null;
    sign(h: Uint8Array, d: Uint8Array, e?: Uint8Array): Uint8Array;
    signSchnorr?(h: Uint8Array, d: Uint8Array, e?: Uint8Array): Uint8Array;
    verify(h: Uint8Array, Q: Uint8Array, signature: Uint8Array, strict?: boolean): boolean;
    verifySchnorr?(h: Uint8Array, Q: Uint8Array, signature: Uint8Array): boolean;
}
export declare function BIP32Factory(ecc: TinySecp256k1Interface): BIP32API;
export {};
