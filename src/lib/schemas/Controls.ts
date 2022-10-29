import { Reader } from "../utils/Reader";

const decoder = new TextDecoder();

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

export class Controls {
    reader:Reader;
    signature:string;
    totalKeyCount:number;
    keyMapping:KeyMap[] = [];

    constructor(buffer:ArrayBuffer, offset:number) {
        this.reader = new Reader(buffer);
        this.reader.seek(offset);

        const sig = this.reader.readBytes(4);

        if (decoder.decode(sig) == "\x53\x47\x42\x31") {
            this.reader.seek(2048, 1);
            this.totalKeyCount = this.reader.readUint32();

            for (let i = 0; i < this.totalKeyCount; i++) {
                const keyMap = new KeyMap(this.reader);
                this.keyMapping.push(keyMap);
            }
        } else {
            throw new Error(`Expected file signature to be ${"\x53\x47\x42\x31"} but it was ${sig}`);
        }
    }
}