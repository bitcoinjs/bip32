"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bip32PathSchema = exports.NetworkSchema = exports.Buffer33Bytes = exports.Buffer256Bit = exports.Uint31Schema = exports.Uint32Schema = void 0;
const v = __importStar(require("valibot"));
exports.Uint32Schema = v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(0xffffffff));
exports.Uint31Schema = v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(0x7fffffff));
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
