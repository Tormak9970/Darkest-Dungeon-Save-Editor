import {Buffer} from "buffer";
import * as LZ4 from "lz4"
import { SAV15_UNCOMPRESSED_SIZE, SAV16_UNCOMPRESSED_SIZE } from "../utils/Utils";

export class LuaState {
    version:number;
    constructor(version:number, inputDicts:any[]) {

    }

    static fromBytes(version:number, buffer:ArrayBuffer) {
        let nodeBuff = Buffer.from(buffer);

        let decomprBytes:Buffer = nodeBuff;
        switch(version) {
            case 15: {
                decomprBytes = Buffer.alloc(SAV15_UNCOMPRESSED_SIZE);
                let uncomprSize = LZ4.decodeBlock(nodeBuff, decomprBytes);
                console.log(uncomprSize);
                break;
            }
            case 16: {
                decomprBytes = Buffer.alloc(SAV16_UNCOMPRESSED_SIZE);
                let uncomprSize = LZ4.decodeBlock(nodeBuff, decomprBytes);
                console.log(uncomprSize);
                break;
            }
        }

        return new LuaState(version, decodeLuaBins(decomprBytes));
    }
}