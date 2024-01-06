const typeforce = require('typeforce');

/**
 * Typeforce extensions
 */
function tfCustomError(expected: any, actual: any) {
  return new typeforce.TfTypeError(expected, {}, actual);
}

function _LengthN(type: any, length: number) {
  const name = type.toJSON();

  function Length(value: any) {
    if (!type(value)) return false;
    if (value.length === length) return true;

    throw tfCustomError(
      name + '(Length: ' + length + ')',
      name + '(Length: ' + value.length + ')',
    );
  }
  Length.toJSON = () => {
    return name;
  };

  return Length;
}

export function Uint8ArrayType(value: unknown): value is Uint8Array {
  return value instanceof Uint8Array;
}

Uint8ArrayType.toJSON = ((t: any) => {
  return t;
}).bind(null, 'Uint8Array');

export const Uint8ArrayTypeN = _LengthN.bind(null, Uint8ArrayType);

/**
 * Uint8Array comparison
 */
export function areUint8ArraysEqual(a: Uint8Array, b: Uint8Array) {
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
