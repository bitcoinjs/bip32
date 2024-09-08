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
export interface Signer {
    publicKey: Uint8Array;
    lowR: boolean;
    sign(hash: Uint8Array, lowR?: boolean): Uint8Array;
    verify(hash: Uint8Array, signature: Uint8Array): boolean;
    signSchnorr(hash: Uint8Array): Uint8Array;
    verifySchnorr(hash: Uint8Array, signature: Uint8Array): boolean;
}
export interface BIP32Interface extends Signer {
    chainCode: Uint8Array;
    network: Network;
    depth: number;
    index: number;
    parentFingerprint: number;
    privateKey?: Uint8Array;
    identifier: Uint8Array;
    fingerprint: Uint8Array;
    isNeutered(): boolean;
    neutered(): BIP32Interface;
    toBase58(): string;
    toWIF(): string;
    derive(index: number): BIP32Interface;
    deriveHardened(index: number): BIP32Interface;
    derivePath(path: string): BIP32Interface;
    tweak(t: Uint8Array): Signer;
}
export interface BIP32API {
    fromSeed(seed: Uint8Array, network?: Network): BIP32Interface;
    fromBase58(inString: string, network?: Network): BIP32Interface;
    fromPublicKey(publicKey: Uint8Array, chainCode: Uint8Array, network?: Network): BIP32Interface;
    fromPrivateKey(privateKey: Uint8Array, chainCode: Uint8Array, network?: Network): BIP32Interface;
}
interface XOnlyPointAddTweakResult {
    parity: 1 | 0;
    xOnlyPubkey: Uint8Array;
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
    xOnlyPointAddTweak?(p: Uint8Array, tweak: Uint8Array): XOnlyPointAddTweakResult | null;
    privateNegate?(d: Uint8Array): Uint8Array;
}
export declare function BIP32Factory(ecc: TinySecp256k1Interface): BIP32API;
export {};
