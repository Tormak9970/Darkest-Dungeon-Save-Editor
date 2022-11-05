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
import { Stack } from "../utils/Utils";
import { DsonField } from "./DsonField";
import { FieldType } from "./DsonTypes";
import type { UnhashBehavior } from "./UnhashBehavior";

const HEADER_SIZE = 64;
export const MAGIC_NUMBER = 0xB101; //45313

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
        if (this.magicNr != MAGIC_NUMBER) throw new Error(`Expected magic number to be ${MAGIC_NUMBER} but was ${this.magicNr}`);

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
    entries:DsonMeta1BlockEntry[] = [];

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
        this.parentIdx = reader.readInt32();
        this.meta2EntryIdx = reader.readUint32();
        this.numDirectChildren = reader.readUint32();
        this.numAllChildren = reader.readUint32();
    }
}


export class DsonMeta2Block {
    entries:DsonMeta2BlockEntry[] = [];

    constructor(reader:Reader, header:DsonHeader) {
        for (let i = 0; i < header.numMeta2Entries; i++) {
            const entry = new DsonMeta2BlockEntry(reader);
            this.entries.push(entry);
        }
    }

    findNextSmallestOffset(offset:number): number {
        let bestIdx = -1;
        let bestOffset = -1;
        for (let i = 0; i < this.entries.length; i++) {
            if (this.entries[i].offset > offset && (bestIdx == -1 || this.entries[i].offset < bestOffset)) {
                bestIdx = i;
                bestOffset = this.entries[i].offset;
                break; // I feel like this will cause issues
            }
        }
        return bestOffset;
    }
}
class DsonMeta2BlockEntry {
    nameHash:number;
    offset:number; //offset in data block relative to the dataOffset
    fieldInfo:number;
    isObject:boolean;
    nameLen:number; //name length with 0
    meta1BlockIdx:number;

    constructor(reader:Reader) {
        this.nameHash = reader.readUint32();
        this.offset = reader.readUint32();
        this.fieldInfo = reader.readUint32();
        this.isObject = (this.fieldInfo & 0b1) == 1;
        this.nameLen = (this.fieldInfo & 0b11111111100) >> 2;
        this.meta1BlockIdx = (this.fieldInfo & 0b1111111111111111111100000000000) >> 11;
    }
}

const decoder = new TextDecoder();

export class DsonData {
    fields:DsonField[] = [];
    
    constructor(reader:Reader, dson:DsonFile, unhashBehavior:UnhashBehavior) {
        const fieldStack = new Stack();
        const parentIdxStack = new Stack();

        let runningObjIdx = -1;
        parentIdxStack.push(runningObjIdx);
        const rootFields:DsonField[] = [];

        for (let i = 0; i < dson.meta2Block.entries.length; i++) {
            const meta2Entry = dson.meta2Block.entries[i];
            const field = new DsonField();
            field.name = DsonData.readName(reader, dson.header.dataOffset + meta2Entry.offset, meta2Entry.nameLen-1);
            
            if (meta2Entry.isObject) {
                field.meta1EntryIdx = meta2Entry.meta1BlockIdx;
            }
            field.meta2EntryIdx = i;
            reader.seek(1, 1);
            field.dataStartInFile = reader.offset;
            field.dataOffRelToData = field.dataStartInFile - dson.header.dataOffset;

            let nextOff = dson.meta2Block.findNextSmallestOffset(meta2Entry.offset);
            let dataLen:number;

            if (nextOff > 0) {
                dataLen = nextOff - field.dataOffRelToData;
            } else {
                dataLen = dson.header.dataLength - field.dataOffRelToData; //accounts for dataStart being relative to begging of reader
            }

            field.rawData = reader.readBytes(dataLen);

            if (meta2Entry.isObject) {
                field.type = FieldType.TYPE_OBJECT;
                field.setNumChildren(dson.meta1Block.entries[meta2Entry.meta1BlockIdx].numDirectChildren);
                runningObjIdx++;
            }

            if (fieldStack.isEmpty()) {
                rootFields.push(field);
            } else {
                if (!fieldStack.peek().addChild(field)) {
                    throw new Error("Failed to add child");
                }
            }

            if (field.type != FieldType.TYPE_OBJECT) {
                field.guessType(unhashBehavior);
            }

            if (JSON.stringify(field.type) == JSON.stringify(FieldType.TYPE_OBJECT)) {
                fieldStack.push(field);
                parentIdxStack.push(runningObjIdx);
            }

            const top = fieldStack.peek();
            while (!fieldStack.isEmpty() && JSON.stringify(top.type) == JSON.stringify(FieldType.TYPE_OBJECT) && top.hasAllChildren()) {
                fieldStack.pop();
                parentIdxStack.pop();
            }
        }
        
        if (!fieldStack.isEmpty()) {
            throw new Error("Not all fields have recieved children");
        }
        if (runningObjIdx + 1 != dson.header.numMeta1Entries) {
            throw new Error("Wrong number of fields");
        }

        this.fields = rootFields;
    }

    static readName(reader:Reader, offset:number, nameLength:number): string {
        reader.seek(offset);
        const res = decoder.decode(reader.readBytes(nameLength));
        return res;
    }
}

export class DsonFile {
    header:DsonHeader;
    meta1Block:DsonMeta1Block;
    meta2Block:DsonMeta2Block;
    data:DsonData

    constructor(reader:Reader, behavior:UnhashBehavior) {
        this.header = new DsonHeader(reader);

        reader.seek(this.header.meta1Offset);
        this.meta1Block = new DsonMeta1Block(reader, this.header);
        
        reader.seek(this.header.meta2Offset);
        this.meta2Block = new DsonMeta2Block(reader, this.header);

        reader.seek(this.header.dataOffset);
        this.data = new DsonData(reader, this, behavior);
    }
}