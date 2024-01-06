export declare function Uint8ArrayType(value: unknown): value is Uint8Array;
export declare namespace Uint8ArrayType {
    var toJSON: () => any;
}
export declare const Uint8ArrayTypeN: (length: number) => {
    (value: any): boolean;
    toJSON(): any;
};
/**
 * Uint8Array comparison
 */
export declare function areUint8ArraysEqual(a: Uint8Array, b: Uint8Array): boolean;
