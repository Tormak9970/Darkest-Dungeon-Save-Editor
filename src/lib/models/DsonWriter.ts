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

import GrowableInt8Array from "../externals/GrowableInt8Array.";

import { getNameIttr, Stack } from "../utils/Utils";
import { Writer } from "../utils/Writer";
import { DsonHeader, DsonMeta1BlockEntry, DsonMeta2BlockEntry, MAGIC_NUMBER } from "./DsonFile";
import { DsonTypes, FieldType } from "./DsonTypes";

function concatBuffs(buffArr:ArrayBuffer[]): ArrayBuffer {
    let res = new Uint8Array(buffArr[0]);

    for (let i = 1; i < buffArr.length; i++) {
        const idxUint = new Uint8Array(buffArr[i]);
        const tmp = new Uint8Array(res.byteLength + idxUint.byteLength);

        tmp.set(res, 0);
        tmp.set(idxUint, res.byteLength);

        res = tmp;
    }

    return res.buffer;
}

const encoder = new TextEncoder();

export class DsonWriter {
    header:DsonHeader;
    private buffArr:ArrayBuffer[]
    data:ArrayBuffer;
    meta1Entries:DsonMeta1BlockEntry[];
    parentIdxStack:Stack<number>;
    nameStack:Stack<string>;
    meta2Entries:DsonMeta2BlockEntry[];

    constructor(json:object) {
        this.header = new DsonHeader();
        this.buffArr = [];

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


        this.data = concatBuffs(this.buffArr);

        this.header.numMeta1Entries = this.meta1Entries.length;
        this.header.meta1Size = this.header.numMeta1Entries << 4;
        this.header.numMeta2Entries = this.meta2Entries.length;
        this.header.meta2Offset = 0x40 + this.meta1Entries.length * 0x10;
        this.header.dataOffset = 0x40 + this.meta1Entries.length * 0x10 + this.meta2Entries.length * 0x0C;
        this.header.dataLength = this.data.byteLength;
        this.parentIdxStack.pop();
    }

    private writeField(name:string, json:any): void {
        const meta2Entr = new DsonMeta2BlockEntry();
        meta2Entr.nameHash = DsonTypes.stringHash(name);
        const nameBytes = encoder.encode(name);
        meta2Entr.fieldInfo = ((nameBytes.length + 1) & 0b111111111) << 2;
        this.meta2Entries.push(meta2Entr);

        const buff = new ArrayBuffer(500);
        const writer = new Writer(buff);

        if (typeof json == "object") {

        } else {
            // write data based on type
            this.nameStack.push(name);

            if (DsonTypes.isA(FieldType.TYPE_FLOATARRAY, getNameIttr(this.nameStack))) {

            } else if (DsonTypes.isA(FieldType.TYPE_INTVECTOR, getNameIttr(this.nameStack))) {

            } else if (DsonTypes.isA(FieldType.TYPE_STRINGVECTOR, getNameIttr(this.nameStack))) {

            } else if (DsonTypes.isA(FieldType.TYPE_FLOAT, getNameIttr(this.nameStack))) {

            } else if (DsonTypes.isA(FieldType.TYPE_TWOINT, getNameIttr(this.nameStack))) {

            } else if (DsonTypes.isA(FieldType.TYPE_CHAR, getNameIttr(this.nameStack))) {

            } else if (typeof json == "number") {
                this.align(writer);
                writer.writeSignedBytes(new Int8Array(this.intBytes(json as number)));
            } else if (typeof json == "string") {
                this.align(writer);
                writer.writeSignedBytes(new Int8Array(this.stringBytes(json as string)));
            } else if (Array.isArray(json)) {

            } else if (typeof json == "boolean") {
                writer.writeByte(json as boolean ? 0x01 : 0x00);
            } else {
                throw new Error("Cant figure out the type of " + name);
            }

            this.nameStack.pop();
        }

        meta2Entr.offset = this.getCurrentDataSize();
        this.buffArr.push(this.trimWriter(writer));
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
            return writer.data;
        }
    }
    
    private intBytes(int:number): ArrayBuffer {
        const writer = new Writer(new Int8Array(4));
        writer.writeInt32(int);
        return writer.data;
    }
    
    bytes(revision:number): ArrayBuffer {
        const writer = new Writer(new Int8Array(0x40 + this.meta1Entries.length * 0x10 + this.meta2Entries.length * 0x0C + this.data.byteLength));

        writer.writeUint32(MAGIC_NUMBER);
        writer.writeUint16(0);
        writer.writeUint16(revision); //epsilon values
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

        writer.writeUnsignedBytes(new Uint8Array(this.data));

        return writer.data;
    }

    private trimWriter(writer:Writer): ArrayBuffer {
        return writer.data.slice(0, writer.offset+1);
    }

    private getCurrentDataSize(curBuff?:ArrayBuffer) {
        let size = 0;
        this.buffArr.forEach((buf) => {
            size += buf.byteLength;
        });
        if (curBuff) size += curBuff.byteLength;
        return size;
    }

    private align(writer:Writer): void {
        writer.writeUnsignedBytes(new Uint8Array((4 - (this.data.byteLength % 4)) % 4));
    }
}