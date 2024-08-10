import * as crypto from './crypto.js';
import { testEcc } from './testecc.js';
import { base58check } from '@scure/base';
import { sha256 } from '@noble/hashes/sha256';
import * as v from 'valibot';
import { Bip32PathSchema, Buffer256Bit, Buffer33Bytes, NetworkSchema, Uint32Schema, } from './types.js';
import * as wif from 'wif';
import * as tools from 'uint8array-tools';
const _bs58check = base58check(sha256);
const bs58check = {
    encode: (data) => _bs58check.encode(data),
    decode: (str) => _bs58check.decode(str),
};
export function BIP32Factory(ecc) {
    testEcc(ecc);
    const BITCOIN = {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'bc',
        bip32: {
            public: 0x0488b21e,
            private: 0x0488ade4,
        },
        pubKeyHash: 0x00,
        scriptHash: 0x05,
        wif: 0x80,
    };
    const HIGHEST_BIT = 0x80000000;
    const UINT31_MAX = Math.pow(2, 31) - 1;
    // @ts-ignore
    function BIP32Path(value) {
        try {
            v.parse(Bip32PathSchema, value);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    function UInt31(value) {
        try {
            v.parse(Uint32Schema, value);
            return value <= UINT31_MAX;
        }
        catch (e) {
            return false;
        }
    }
    function toXOnly(pubKey) {
        return pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);
    }
    class Bip32Signer {
        __D;
        __Q;
        lowR = false;
        constructor(__D, __Q) {
            this.__D = __D;
            this.__Q = __Q;
        }
        get publicKey() {
            if (this.__Q === undefined)
                this.__Q = ecc.pointFromScalar(this.__D, true);
            return this.__Q;
        }
        get privateKey() {
            return this.__D;
        }
        sign(hash, lowR) {
            if (!this.privateKey)
                throw new Error('Missing private key');
            if (lowR === undefined)
                lowR = this.lowR;
            if (lowR === false) {
                return ecc.sign(hash, this.privateKey);
            }
            else {
                let sig = ecc.sign(hash, this.privateKey);
                const extraData = new Uint8Array(32);
                let counter = 0;
                // if first try is lowR, skip the loop
                // for second try and on, add extra entropy counting up
                while (sig[0] > 0x7f) {
                    counter++;
                    tools.writeUInt32(extraData, 0, counter, 'LE');
                    sig = ecc.sign(hash, this.privateKey, extraData);
                }
                return sig;
            }
        }
        signSchnorr(hash) {
            if (!this.privateKey)
                throw new Error('Missing private key');
            if (!ecc.signSchnorr)
                throw new Error('signSchnorr not supported by ecc library');
            return ecc.signSchnorr(hash, this.privateKey);
        }
        verify(hash, signature) {
            return ecc.verify(hash, this.publicKey, signature);
        }
        verifySchnorr(hash, signature) {
            if (!ecc.verifySchnorr)
                throw new Error('verifySchnorr not supported by ecc library');
            return ecc.verifySchnorr(hash, this.publicKey.subarray(1, 33), signature);
        }
    }
    class BIP32 extends Bip32Signer {
        chainCode;
        network;
        __DEPTH;
        __INDEX;
        __PARENT_FINGERPRINT;
        constructor(__D, __Q, chainCode, network, __DEPTH = 0, __INDEX = 0, __PARENT_FINGERPRINT = 0x00000000) {
            super(__D, __Q);
            this.chainCode = chainCode;
            this.network = network;
            this.__DEPTH = __DEPTH;
            this.__INDEX = __INDEX;
            this.__PARENT_FINGERPRINT = __PARENT_FINGERPRINT;
            // typeforce(NETWORK_TYPE, network);
            v.parse(NetworkSchema, network);
        }
        get depth() {
            return this.__DEPTH;
        }
        get index() {
            return this.__INDEX;
        }
        get parentFingerprint() {
            return this.__PARENT_FINGERPRINT;
        }
        get identifier() {
            return crypto.hash160(this.publicKey);
        }
        get fingerprint() {
            return this.identifier.slice(0, 4);
        }
        get compressed() {
            return true;
        }
        // Private === not neutered
        // Public === neutered
        isNeutered() {
            return this.__D === undefined;
        }
        neutered() {
            return fromPublicKeyLocal(this.publicKey, this.chainCode, this.network, this.depth, this.index, this.parentFingerprint);
        }
        toBase58() {
            const network = this.network;
            const version = !this.isNeutered()
                ? network.bip32.private
                : network.bip32.public;
            const buffer = new Uint8Array(78);
            // 4 bytes: version bytes
            // buffer.writeUInt32BE(version, 0);
            tools.writeUInt32(buffer, 0, version, 'BE');
            // 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants, ....
            // buffer.writeUInt8(this.depth, 4);
            tools.writeUInt8(buffer, 4, this.depth);
            // 4 bytes: the fingerprint of the parent's key (0x00000000 if master key)
            // buffer.writeUInt32BE(this.parentFingerprint, 5);
            tools.writeUInt32(buffer, 5, this.parentFingerprint, 'BE');
            // 4 bytes: child number. This is the number i in xi = xpar/i, with xi the key being serialized.
            // This is encoded in big endian. (0x00000000 if master key)
            // buffer.writeUInt32BE(this.index, 9);
            tools.writeUInt32(buffer, 9, this.index, 'BE');
            // 32 bytes: the chain code
            // this.chainCode.copy(buffer, 13);
            buffer.set(this.chainCode, 13);
            // 33 bytes: the public key or private key data
            if (!this.isNeutered()) {
                // 0x00 + k for private keys
                // buffer.writeUInt8(0, 45);
                tools.writeUInt8(buffer, 45, 0);
                // this.privateKey!.copy(buffer, 46);
                buffer.set(this.privateKey, 46);
                // 33 bytes: the public key
            }
            else {
                // X9.62 encoding for public keys
                // this.publicKey.copy(buffer, 45);
                buffer.set(this.publicKey, 45);
            }
            return bs58check.encode(buffer);
        }
        toWIF() {
            if (!this.privateKey)
                throw new TypeError('Missing private key');
            return wif.encode({
                version: this.network.wif,
                privateKey: this.privateKey,
                compressed: true,
            });
        }
        // https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#child-key-derivation-ckd-functions
        derive(index) {
            // typeforce(typeforce.UInt32, index);
            v.parse(Uint32Schema, index);
            const isHardened = index >= HIGHEST_BIT;
            const data = new Uint8Array(37);
            // Hardened child
            if (isHardened) {
                if (this.isNeutered())
                    throw new TypeError('Missing private key for hardened child key');
                // data = 0x00 || ser256(kpar) || ser32(index)
                data[0] = 0x00;
                // this.privateKey!.copy(data, 1);
                data.set(this.privateKey, 1);
                // data.writeUInt32BE(index, 33);
                tools.writeUInt32(data, 33, index, 'BE');
                // Normal child
            }
            else {
                // data = serP(point(kpar)) || ser32(index)
                //      = serP(Kpar) || ser32(index)
                // this.publicKey.copy(data, 0);
                data.set(this.publicKey, 0);
                // data.writeUInt32BE(index, 33);
                tools.writeUInt32(data, 33, index, 'BE');
            }
            const I = crypto.hmacSHA512(this.chainCode, data);
            const IL = I.slice(0, 32);
            const IR = I.slice(32);
            // if parse256(IL) >= n, proceed with the next value for i
            if (!ecc.isPrivate(IL))
                return this.derive(index + 1);
            // Private parent key -> private child key
            let hd;
            if (!this.isNeutered()) {
                // ki = parse256(IL) + kpar (mod n)
                const ki = ecc.privateAdd(this.privateKey, IL);
                // In case ki == 0, proceed with the next value for i
                if (ki == null)
                    return this.derive(index + 1);
                hd = fromPrivateKeyLocal(ki, IR, this.network, this.depth + 1, index, 
                // this.fingerprint.readUInt32BE(0),
                tools.readUInt32(this.fingerprint, 0, 'BE'));
                // Public parent key -> public child key
            }
            else {
                // Ki = point(parse256(IL)) + Kpar
                //    = G*IL + Kpar
                const Ki = ecc.pointAddScalar(this.publicKey, IL, true);
                // In case Ki is the point at infinity, proceed with the next value for i
                if (Ki === null)
                    return this.derive(index + 1);
                hd = fromPublicKeyLocal(Ki, IR, this.network, this.depth + 1, index, 
                // this.fingerprint.readUInt32BE(0),
                tools.readUInt32(this.fingerprint, 0, 'BE'));
            }
            return hd;
        }
        deriveHardened(index) {
            if (UInt31(index))
                // Only derives hardened private keys by default
                return this.derive(index + HIGHEST_BIT);
            throw new TypeError('Expected UInt31, got ' + index);
        }
        derivePath(path) {
            // typeforce(BIP32Path, path);
            v.parse(Bip32PathSchema, path);
            let splitPath = path.split('/');
            if (splitPath[0] === 'm') {
                if (this.parentFingerprint)
                    throw new TypeError('Expected master, got child');
                splitPath = splitPath.slice(1);
            }
            return splitPath.reduce((prevHd, indexStr) => {
                let index;
                if (indexStr.slice(-1) === `'`) {
                    index = parseInt(indexStr.slice(0, -1), 10);
                    return prevHd.deriveHardened(index);
                }
                else {
                    index = parseInt(indexStr, 10);
                    return prevHd.derive(index);
                }
            }, this);
        }
        tweak(t) {
            if (this.privateKey)
                return this.tweakFromPrivateKey(t);
            return this.tweakFromPublicKey(t);
        }
        tweakFromPublicKey(t) {
            const xOnlyPubKey = toXOnly(this.publicKey);
            if (!ecc.xOnlyPointAddTweak)
                throw new Error('xOnlyPointAddTweak not supported by ecc library');
            const tweakedPublicKey = ecc.xOnlyPointAddTweak(xOnlyPubKey, t);
            if (!tweakedPublicKey || tweakedPublicKey.xOnlyPubkey === null)
                throw new Error('Cannot tweak public key!');
            const parityByte = Uint8Array.from([
                tweakedPublicKey.parity === 0 ? 0x02 : 0x03,
            ]);
            const tweakedPublicKeyCompresed = tools.concat([
                parityByte,
                tweakedPublicKey.xOnlyPubkey,
            ]);
            return new Bip32Signer(undefined, tweakedPublicKeyCompresed);
        }
        tweakFromPrivateKey(t) {
            const hasOddY = this.publicKey[0] === 3 ||
                (this.publicKey[0] === 4 && (this.publicKey[64] & 1) === 1);
            const privateKey = (() => {
                if (!hasOddY)
                    return this.privateKey;
                else if (!ecc.privateNegate)
                    throw new Error('privateNegate not supported by ecc library');
                else
                    return ecc.privateNegate(this.privateKey);
            })();
            const tweakedPrivateKey = ecc.privateAdd(privateKey, t);
            if (!tweakedPrivateKey)
                throw new Error('Invalid tweaked private key!');
            return new Bip32Signer(tweakedPrivateKey, undefined);
        }
    }
    function fromBase58(inString, network) {
        const buffer = bs58check.decode(inString);
        if (buffer.length !== 78)
            throw new TypeError('Invalid buffer length');
        network = network || BITCOIN;
        // 4 bytes: version bytes
        // const version = buffer.readUInt32BE(0);
        const version = tools.readUInt32(buffer, 0, 'BE');
        if (version !== network.bip32.private && version !== network.bip32.public)
            throw new TypeError('Invalid network version');
        // 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants, ...
        const depth = buffer[4];
        // 4 bytes: the fingerprint of the parent's key (0x00000000 if master key)
        // const parentFingerprint = buffer.readUInt32BE(5);
        const parentFingerprint = tools.readUInt32(buffer, 5, 'BE');
        if (depth === 0) {
            if (parentFingerprint !== 0x00000000)
                throw new TypeError('Invalid parent fingerprint');
        }
        // 4 bytes: child number. This is the number i in xi = xpar/i, with xi the key being serialized.
        // This is encoded in MSB order. (0x00000000 if master key)
        // const index = buffer.readUInt32BE(9);
        const index = tools.readUInt32(buffer, 9, 'BE');
        if (depth === 0 && index !== 0)
            throw new TypeError('Invalid index');
        // 32 bytes: the chain code
        const chainCode = buffer.slice(13, 45);
        let hd;
        // 33 bytes: private key data (0x00 + k)
        if (version === network.bip32.private) {
            // if (buffer.readUInt8(45) !== 0x00)
            if (buffer[45] !== 0x00)
                throw new TypeError('Invalid private key');
            const k = buffer.slice(46, 78);
            hd = fromPrivateKeyLocal(k, chainCode, network, depth, index, parentFingerprint);
            // 33 bytes: public key data (0x02 + X or 0x03 + X)
        }
        else {
            const X = buffer.slice(45, 78);
            hd = fromPublicKeyLocal(X, chainCode, network, depth, index, parentFingerprint);
        }
        return hd;
    }
    function fromPrivateKey(privateKey, chainCode, network) {
        return fromPrivateKeyLocal(privateKey, chainCode, network);
    }
    function fromPrivateKeyLocal(privateKey, chainCode, network, depth, index, parentFingerprint) {
        v.parse(Buffer256Bit, privateKey);
        v.parse(Buffer256Bit, chainCode);
        network = network || BITCOIN;
        if (!ecc.isPrivate(privateKey))
            throw new TypeError('Private key not in range [1, n)');
        return new BIP32(privateKey, undefined, chainCode, network, depth, index, parentFingerprint);
    }
    function fromPublicKey(publicKey, chainCode, network) {
        return fromPublicKeyLocal(publicKey, chainCode, network);
    }
    function fromPublicKeyLocal(publicKey, chainCode, network, depth, index, parentFingerprint) {
        v.parse(Buffer33Bytes, publicKey);
        v.parse(Buffer256Bit, chainCode);
        network = network || BITCOIN;
        // verify the X coordinate is a point on the curve
        if (!ecc.isPoint(publicKey))
            throw new TypeError('Point is not on the curve');
        return new BIP32(undefined, publicKey, chainCode, network, depth, index, parentFingerprint);
    }
    function fromSeed(seed, network) {
        v.parse(v.instance(Uint8Array), seed);
        if (seed.length < 16)
            throw new TypeError('Seed should be at least 128 bits');
        if (seed.length > 64)
            throw new TypeError('Seed should be at most 512 bits');
        network = network || BITCOIN;
        const I = crypto.hmacSHA512(tools.fromUtf8('Bitcoin seed'), seed);
        const IL = I.slice(0, 32);
        const IR = I.slice(32);
        return fromPrivateKey(IL, IR, network);
    }
    return {
        fromSeed,
        fromBase58,
        fromPublicKey,
        fromPrivateKey,
    };
}
