/**
 * DarkestDungeon Save Editor is a tool for viewing and modifying DarkestDungeon game saves.
 * Copyright (C) 2022 Travis Lane (Tormak)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>
 */
import { getNameIttr, Stack } from "../utils/Utils";
import { Writer } from "../utils/Writer";
import { DsonHeader, DsonMeta1BlockEntry, DsonMeta2BlockEntry, MAGIC_NUMBER } from "./DsonFile";
import { DsonTypes, FieldType } from "./DsonTypes";

const encoder = new TextEncoder();

/**
 * Converts edited JSON data to a DarkestDungeon save file
 */
export class DsonWriter {
    header:DsonHeader;
    data:Writer;
    meta1Entries:DsonMeta1BlockEntry[];
    parentIdxStack:Stack<number>;
    nameStack:Stack<string>;
    meta2Entries:DsonMeta2BlockEntry[];
    revision:number;

    constructor(json:object, revision:number) {
        this.header = new DsonHeader();
        this.data = new Writer(new Uint8Array(10000));
        this.revision = revision;

        this.header.headerLength = 0x40;
        this.header.meta1Offset = 0x40;

        this.meta1Entries = [];
        this.meta2Entries = [];
        this.parentIdxStack = new Stack();
        this.nameStack = new Stack();
        this.parentIdxStack.push(-1);

        const jsonEntries = Object.entries(json);
        for (let i = 0; i < jsonEntries.length; i++) {
            const entr = jsonEntries[i];
            const name = entr[0];
            const data = entr[1];

            this.writeField(name, data);
        }

        this.data.trim();

        this.header.numMeta1Entries = this.meta1Entries.length;
        this.header.meta1Size = this.header.numMeta1Entries << 4;
        this.header.numMeta2Entries = this.meta2Entries.length;
        this.header.meta2Offset = 0x40 + this.meta1Entries.length * 0x10;
        this.header.dataOffset = 0x40 + this.meta1Entries.length * 0x10 + this.meta2Entries.length * 0x0C;
        this.header.dataLength = this.data.length;
        this.parentIdxStack.pop();
    }

    private writeField(name:string, json:any): void {
        const meta2Entr = new DsonMeta2BlockEntry();
        meta2Entr.nameHash = DsonTypes.stringHash(name);
        const nameBytes = encoder.encode(name);
        meta2Entr.fieldInfo = ((nameBytes.length + 1) & 0b111111111) << 2;
        this.meta2Entries.push(meta2Entr);

        meta2Entr.offset = this.data.offset;
        this.data.writeUnsignedBytes(new Uint8Array(nameBytes));
        this.data.writeByte(0x00);

        // TODO validate both object and non object writing
        if (typeof json == "object") {
            if (name != "raw_data" && name != "static_save") {
                const meta1Entr = new DsonMeta1BlockEntry();
                meta1Entr.meta2EntryIdx = this.meta2Entries.length - 1;
                meta2Entr.fieldInfo |= 0b1 | ((this.meta1Entries.length & 0b11111111111111111111) << 11);
                meta1Entr.parentIdx = this.parentIdxStack.peek();
                this.meta1Entries.push(meta1Entr);

                const prevNumChld = this.meta2Entries.length;
                this.parentIdxStack.push(this.meta1Entries.length - 1);
                this.nameStack.push(name);
                meta1Entr.numDirectChildren = Object.values(json).length;

                const children = Object.entries(json);
                for (let i = 0; i < meta1Entr.numDirectChildren; i++) {
                    const kvp = children[i];
                    this.writeField(kvp[0], kvp[1]);
                }

                this.nameStack.pop();
                this.parentIdxStack.pop();
                meta1Entr.numAllChildren = this.meta2Entries.length - prevNumChld;
            } else {
                const subFile = new DsonWriter(json, this.revision);
                this.align();
                const embededData = subFile.bytes();
                this.data.writeInt32(embededData.byteLength);
                this.data.writeSignedBytes(new Int8Array(embededData));
            }
        } else {
            // write data based on type
            this.nameStack.push(name);

            if (DsonTypes.isA(FieldType.TYPE_FLOATARRAY, getNameIttr(this.nameStack))) {
                this.align();
                for (let i = 0; i < json.length; i++) {
                    this.data.writeUnsignedBytes(new Uint8Array(this.floatBytes(json[i])));
                }
            } else if (DsonTypes.isA(FieldType.TYPE_INTVECTOR, getNameIttr(this.nameStack))) {
                this.align();

                const vecData = new Writer(new Uint8Array(1000));

                for (let i = 0; i < json.length; i++) {
                    if (typeof json[i] == "string") {
                        if (!json[i].startsWith("###")) {
                            throw new Error("Expected hashed string");
                        } else {
                            vecData.writeUnsignedBytes(new Uint8Array(this.stringBytes(json[i])));
                        }
                    } else {
                        vecData.writeUint32(json[i]);
                    }
                }
                
                this.data.writeInt32(json.length);
                vecData.trim();
                this.data.writeUnsignedBytes(new Uint8Array(vecData.data));
            } else if (DsonTypes.isA(FieldType.TYPE_STRINGVECTOR, getNameIttr(this.nameStack))) {
                this.align();

                const vecData = new Writer(new Uint8Array(1000));

                for (let i = 0; i < json.length; i++) {
                    const str = json[i];
                    vecData.writeUint32((4 - (vecData.offset % 4)) % 4);
                    vecData.writeUnsignedBytes(new Uint8Array(this.stringBytes(str)));
                }
                
                this.data.writeInt32(json.length);
                vecData.trim();
                this.data.writeUnsignedBytes(new Uint8Array(vecData.data));
            } else if (DsonTypes.isA(FieldType.TYPE_FLOAT, getNameIttr(this.nameStack))) {
                // ! validated
                this.align();
                this.data.writeSignedBytes(new Int8Array(this.floatBytes(json as number)));
            } else if (DsonTypes.isA(FieldType.TYPE_TWOINT, getNameIttr(this.nameStack))) {
                this.align();
                if (typeof json[0] == "number" && typeof json[1] == "number") {
                    this.data.writeInt32(json[0]);
                    this.data.writeInt32(json[1]);
                } else {
                    throw new Error(`Expected ${name} field value to be a TWO_BOOL array`)
                }
            } else if (DsonTypes.isA(FieldType.TYPE_CHAR, getNameIttr(this.nameStack))) {
                this.data.writeByte((json as string).charCodeAt(0));
            } else if (typeof json == "number") {
                // ! validated
                this.align();
                this.data.writeInt32(json as number);
            } else if (typeof json == "string") {
                // ! validated
                this.align();
                this.data.writeUnsignedBytes(new Uint8Array(this.stringBytes(json as string)));
            } else if (Array.isArray(json)) {
                this.align();
                if ((json[0] == true || json[0] == false) && (json[1] == true || json[1] == false)) {
                    this.data.writeByte(json[0] as boolean ? 0x01 : 0x00);
                    this.data.writeByte(json[1] as boolean ? 0x01 : 0x00);
                } else {
                    throw new Error(`Expected ${name} field value to be a TWO_BOOL array`)
                }
            } else if (typeof json == "boolean") {
                // ! validated
                this.data.writeByte(json as boolean ? 0x01 : 0x00);
            } else {
                throw new Error("Cant figure out the type of " + name);
            }

            this.nameStack.pop();
        }
    }

    private floatBytes(float:number): ArrayBuffer {
        const writer = new Writer(new Int8Array(4));
        writer.writeFloat32(float);
        return writer.data;
    }
    
    private stringBytes(str:string): ArrayBuffer {
        if (str.startsWith("###")) {
            const hash = DsonTypes.stringHash(str.substring(3));
            return this.intBytes(hash);
        } else {
            const strBytes = encoder.encode(str);
            const writer = new Writer(new Int8Array(5 + strBytes.length));
            writer.writeInt32(strBytes.length+1);
            writer.writeUnsignedBytes(strBytes);
            writer.writeByte(0x00);

            writer.trim();
            return writer.data;
        }
    }
    
    private intBytes(int:number): ArrayBuffer {
        const writer = new Writer(new Int8Array(4));
        writer.writeInt32(int);
        writer.trim();
        return writer.data;
    }
    
    /**
     * Gets the ArrayBuffer representing this save file
     * @returns The ArrayBuffer representing this save file
     */
    bytes(): ArrayBuffer {
        const writer = new Writer(new Int8Array(0x40 + this.meta1Entries.length * 0x10 + this.meta2Entries.length * 0x0C + this.data.length));

        writer.writeUint32(MAGIC_NUMBER);
        writer.writeUint16(0);
        writer.writeUint16(this.revision); //epsilon values
        writer.writeUint32(this.header.headerLength);

        writer.writeUint32(0); //zeroes

        writer.writeUint32(this.header.meta1Size);
        writer.writeUint32(this.header.numMeta1Entries);
        writer.writeUint32(this.header.meta1Offset);

        writer.writeUint32(0); //zeroes2
        writer.writeUint32(0); //zeroes2
        writer.writeUint32(0); //zeroes3
        writer.writeUint32(0); //zeroes3

        writer.writeUint32(this.header.numMeta2Entries);
        writer.writeUint32(this.header.meta2Offset);
        
        writer.writeUint32(0); //zeroes4

        writer.writeUint32(this.header.dataLength);
        writer.writeUint32(this.header.dataOffset);

        for (let i = 0; i < this.meta1Entries.length; i++) {
            const entr = this.meta1Entries[i];
            writer.writeUint32(entr.parentIdx);
            writer.writeUint32(entr.meta2EntryIdx);
            writer.writeUint32(entr.numDirectChildren);
            writer.writeUint32(entr.numAllChildren);
        }

        for (let i = 0; i < this.meta2Entries.length; i++) {
            const entr = this.meta2Entries[i];
            writer.writeUint32(entr.nameHash);
            writer.writeUint32(entr.offset);
            writer.writeUint32(entr.fieldInfo);
        }

        writer.writeUnsignedBytes(new Uint8Array(this.data.data));

        writer.trim();
        return writer.data;
    }

    private align(): void {
        this.data.writeUnsignedBytes(new Uint8Array((4 - ((this.data.offset) % 4)) % 4));
    }
}