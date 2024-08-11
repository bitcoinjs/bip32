import * as v from 'valibot';
export const Uint32Schema = v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(0xffffffff));
export const Uint31Schema = v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(0x7fffffff));
const Uint8Schema = v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(0xff));
export const Buffer256Bit = v.pipe(v.instance(Uint8Array), v.length(32));
export const Buffer33Bytes = v.pipe(v.instance(Uint8Array), v.length(33));
export const NetworkSchema = v.object({
    wif: Uint8Schema,
    bip32: v.object({
        public: Uint32Schema,
        private: Uint32Schema,
    }),
});
export const Bip32PathSchema = v.pipe(v.string(), v.regex(/^(m\/)?(\d+'?\/)*\d+'?$/));
