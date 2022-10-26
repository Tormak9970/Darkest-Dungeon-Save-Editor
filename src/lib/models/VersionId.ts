import { Reader } from "../utils/Reader";
import { FILE_SIGNATURE } from "../utils/Utils";

export class KeyMap {
    keyBound:number;
    name:string;
    keyCount:number;
    keyboardKeys:number[] = [];
    gamepadKeys:number;
    mouseKeys:number;
    gamepadEnabled:boolean;
    useShift:boolean;

    constructor(reader:Reader) {
        this.keyBound = reader.readUint32();
        const nameLength = reader.readUint32();
        this.name = reader.readString(nameLength);
        this.keyCount = reader.readUint32();

        for (let i = 0; i < this.keyCount; i++) {
            this.keyboardKeys.push(reader.readUint32());
        }

        this.gamepadKeys = reader.readUint32();
        this.mouseKeys = reader.readUint32();
        this.gamepadEnabled = reader.readByte() == 1;
        this.useShift = reader.readByte() == 1;
    }
}

export class VersionId {
    signature:string;
    checksum:number;
    version:number

    constructor(buffer:ArrayBuffer, offset:number) {
        const reader = new Reader(buffer);
        reader.seek(offset);

        const sig = reader.readUint32();

        if (sig.toString() == FILE_SIGNATURE) {
            this.checksum = reader.readUint32();
            this.version = reader.readUint32();
        } else {
            throw new Error(`Expected file signature to be ${FILE_SIGNATURE} but it was ${sig}`);
        }
    }
}