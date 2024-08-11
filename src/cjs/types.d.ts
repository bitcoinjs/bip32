import * as v from 'valibot';
export declare const Uint32Schema: v.SchemaWithPipe<[v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, 4294967295, undefined>]>;
export declare const Uint31Schema: v.SchemaWithPipe<[v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, 2147483647, undefined>]>;
export declare const Buffer256Bit: v.SchemaWithPipe<[v.InstanceSchema<Uint8ArrayConstructor, undefined>, v.LengthAction<Uint8Array, 32, undefined>]>;
export declare const Buffer33Bytes: v.SchemaWithPipe<[v.InstanceSchema<Uint8ArrayConstructor, undefined>, v.LengthAction<Uint8Array, 33, undefined>]>;
export declare const NetworkSchema: v.ObjectSchema<{
    readonly wif: v.SchemaWithPipe<[v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, 255, undefined>]>;
    readonly bip32: v.ObjectSchema<{
        readonly public: v.SchemaWithPipe<[v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, 4294967295, undefined>]>;
        readonly private: v.SchemaWithPipe<[v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>, v.MaxValueAction<number, 4294967295, undefined>]>;
    }, undefined>;
}, undefined>;
export declare const Bip32PathSchema: v.SchemaWithPipe<[v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
export type Network = v.InferOutput<typeof NetworkSchema>;
