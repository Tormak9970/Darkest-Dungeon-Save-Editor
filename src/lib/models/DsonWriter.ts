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

import { Stack } from "../utils/Utils";
import { Writer } from "../utils/Writer";
import { DsonHeader, DsonMeta1BlockEntry, DsonMeta2BlockEntry, MAGIC_NUMBER } from "./DsonFile";
import { DsonTypes } from "./DsonTypes";

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
    parentIdxStack:Stack;
    nameStack:Stack;
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

    private writeField(name:string, data:Object): void {

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
        writer.writeUint32(this.header.meta2Offset)

        return writer.data;
    }

    private align(): void {

    }
}