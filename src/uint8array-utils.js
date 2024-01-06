"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.areUint8ArraysEqual = exports.Uint8ArrayTypeN = exports.Uint8ArrayType = void 0;
const typeforce = require('typeforce');
/**
 * Typeforce extensions
 */
function tfCustomError(expected, actual) {
    return new typeforce.TfTypeError(expected, {}, actual);
}
function _LengthN(type, length) {
    const name = type.toJSON();
    function Length(value) {
        if (!type(value))
            return false;
        if (value.length === length)
            return true;
        throw tfCustomError(name + '(Length: ' + length + ')', name + '(Length: ' + value.length + ')');
    }
    Length.toJSON = () => {
        return name;
    };
    return Length;
}
function Uint8ArrayType(value) {
    return value instanceof Uint8Array;
}
exports.Uint8ArrayType = Uint8ArrayType;
Uint8ArrayType.toJSON = ((t) => {
    return t;
}).bind(null, 'Uint8Array');
exports.Uint8ArrayTypeN = _LengthN.bind(null, Uint8ArrayType);
/**
 * Uint8Array comparison
 */
function areUint8ArraysEqual(a, b) {
    if (a === b) {
        return true;
    }
    if (a.length !== b.length) {
        return false;
    }
    for (let index = 0; index < a.length; index++) {
        if (a[index] !== b[index]) {
            return false;
        }
    }
    return true;
}
exports.areUint8ArraysEqual = areUint8ArraysEqual;
