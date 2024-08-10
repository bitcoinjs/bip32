"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bip32PathSchema = exports.NetworkSchema = exports.Buffer33Bytes = exports.Buffer256Bit = exports.Uint32Schema = void 0;
const v = require("valibot");
exports.Uint32Schema = v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(0xffffffff));
const Uint8Schema = v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(0xff));
exports.Buffer256Bit = v.pipe(v.instance(Uint8Array), v.length(32));
exports.Buffer33Bytes = v.pipe(v.instance(Uint8Array), v.length(33));
exports.NetworkSchema = v.object({
    wif: Uint8Schema,
    bip32: v.object({
        public: exports.Uint32Schema,
        private: exports.Uint32Schema,
    }),
});
exports.Bip32PathSchema = v.pipe(v.string(), v.regex(/^(m\/)?(\d+'?\/)*\d+'?$/));
