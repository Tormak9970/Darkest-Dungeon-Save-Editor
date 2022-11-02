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
import type { Reader } from "../utils/Reader";

const HEADER_SIZE = 64;

export class DsonHeader {
    magicNr:number;
    revision:number;
    headerLength:number;
    
    meta1Size:number;
    numMeta1Entries:number;
    meta1Offset:number;
    
    numMeta2Entries:number;
    meta2Offset:number;
    
    dataLength:number;
    dataOffset:number;

    constructor(reader:Reader) {
        this.magicNr = reader.readUint32();
        if (this.magicNr != 0x01B100) throw new Error(`Expected magic number to be ${0x01B100} but was ${this.magicNr}`);

        reader.readInt16(); //empty bytes
        this.revision = reader.readUint16();

        this.headerLength = reader.readUint32();
        if (this.headerLength != HEADER_SIZE) throw new Error(`Expected header length to be 64 but was ${this.headerLength}`);

        reader.readUint32(); //zeroes

        this.meta1Size = reader.readUint32();
        this.numMeta1Entries = reader.readUint32();
        this.meta1Offset = reader.readUint32();

        reader.readUint32(); //zeroes2
        reader.readUint32(); //zeroes2
        reader.readUint32(); //zeroes3
        reader.readUint32(); //zeroes3

        this.numMeta2Entries = reader.readUint32();
        this.meta2Offset = reader.readUint32();
        
        reader.readUint32(); //zeroes4

        this.dataLength = reader.readUint32();
        this.dataOffset = reader.readUint32();
    }
}

export class DsonMeta1Block {
    entries:DsonMeta1BlockEntry[];

    constructor(reader:Reader, header:DsonHeader) {
        for (let i = 0; i < header.numMeta1Entries; i++) {
            const entry = new DsonMeta1BlockEntry(reader);
            this.entries.push(entry);
        }
    }
}
class DsonMeta1BlockEntry {
    parentIdx:number; //-1 means root
    meta2EntryIdx:number;
    numDirectChildren:number;
    numAllChildren:number;

    constructor(reader:Reader) {
        this.parentIdx = reader.readUint32();
        this.meta2EntryIdx = reader.readUint32();
        this.numDirectChildren = reader.readUint32();
        this.numAllChildren = reader.readUint32();
    }
}


export class DsonMeta2Block {
    entries:DsonMeta2BlockEntry[];

    constructor(reader:Reader, header:DsonHeader) {
        for (let i = 0; i < header.numMeta2Entries; i++) {
            const entry = new DsonMeta2BlockEntry(reader);
            this.entries.push(entry);
        }
    }
}
class DsonMeta2BlockEntry {
    nameHash:number;
    offset:number; //offset in data block relative to the dataOffset
    fieldInfo:number;
    isObject:boolean;
    nameLen:number; //name length with 0
    meta1BlockIdx:number;

    // (fieldInfo & 0b1) as a boolean. If set, this is an object, if not set, this is a "primitive" field.
    // (fieldInfo & 0b11111111100) >> 2 as an integer is the length of the field name including the \0 character.
    // (fieldInfo & 0b1111111111111111111100000000000) >> 11 as an integer is the index into the Meta1Block entries if this is an object.

    constructor(reader:Reader) {
        this.nameHash = reader.readUint32();
        this.offset = reader.readUint32();
        this.fieldInfo = reader.readUint32();
        this.isObject = Boolean(this.fieldInfo & 0x0b1);
        this.nameLen = (this.fieldInfo & 0b11111111100) >> 2;
        this.meta1BlockIdx = (this.fieldInfo & 0b1111111111111111111100000000000) >> 11;
    }
}

export class DsonData {
    constructor(reader:Reader, dson:Dson) {

    }
}
class DsonField {
    constructor(reader:Reader) {

    }
}

export class Dson {
    header:DsonHeader;
    meta1Block:DsonMeta1Block;
    meta2Block:DsonMeta2Block;
    data:DsonData

    constructor(reader:Reader) {
        this.header = new DsonHeader(reader);

        reader.seek(this.header.meta1Offset);
        this.meta1Block = new DsonMeta1Block(reader, this.header);
        
        reader.seek(this.header.meta2Offset);
        this.meta2Block = new DsonMeta2Block(reader, this.header);

        reader.seek(this.header.dataOffset);
        this.data = new DsonData(reader, this);
    }
}