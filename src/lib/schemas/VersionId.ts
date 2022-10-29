import type { Reader } from "../utils/Reader";
import { FILE_SIGNATURE } from "../utils/Utils";

const decoder = new TextDecoder();

export class VersionId {
    signature:string;
    checksum:number;
    version:number

    constructor(reader:Reader) {
        const sig = reader.readBytes(4);

        if (decoder.decode(sig) == FILE_SIGNATURE) {
            this.signature = decoder.decode(sig);
            this.checksum = reader.readUint32();
            this.version = reader.readUint32();
        } else {
            throw new Error(`Expected file signature to be ${FILE_SIGNATURE} but it was ${sig}`);
        }
    }
}