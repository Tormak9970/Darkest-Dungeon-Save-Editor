import { Reader } from "../utils/Reader";
import { LuaState } from "./LuaState";
import { RawSaveFile } from "./RawSaveFile";

const decoder = new TextDecoder();

export class SaveFile {
    signature:string;

    constructor() {
        
    }

    static fromFile(buffer:ArrayBuffer) {
        const reader = new Reader(buffer);

        const rawSaveFile = RawSaveFile.fromFile(reader);
        console.log(rawSaveFile);

        const luaState = LuaState.fromBytes(rawSaveFile.version, buffer);
        console.log(luaState);
    }
}