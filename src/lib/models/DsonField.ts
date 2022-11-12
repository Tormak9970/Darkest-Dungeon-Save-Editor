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
import { Reader } from "../utils/Reader";
import type { Iterator, IteratorGenerator } from "../utils/Utils";
import { DsonFile, MAGIC_NUMBER } from "./DsonFile";
import { DsonTypes, FieldType } from "./DsonTypes";
import { UnhashBehavior } from "./UnhashBehavior";

const decoder = new TextDecoder();

/**
 * Represents a field in a DarkestDungeon save file
 */
export class DsonField {
    dataStartInFile:number;
    meta1EntryIdx = -1;
    meta2EntryIdx = -1;

    name:string;
    type:any = FieldType.TYPE_UNKNOWN;
    parent:DsonField;

    rawData:Int8Array;
    dataValue = null;
    dataString = "\"UNKNOWN. PLEASE PARSE TYPE\"";
    hashedValue:string;
    embeddedFile:DsonFile;

    numChildren:number;
    children:DsonField[];

    constructor() {
        this.children = [];
    }

    /**
     * Attempts to determine the data type of this field
     * @param behavior The unhash behavior
     * @returns True if type was determined
     */
    guessType(behavior:UnhashBehavior): boolean {
        if (this.parseHardcodedType(behavior)) {
            return true;
        } else if (this.rawData.length == 1) {
            if (this.rawData[0] >= 0x20 && this.rawData[0] <= 0x7E) {
                this.type = FieldType.TYPE_CHAR;
                this.dataValue = String.fromCharCode(this.rawData[0]);
                this.dataString = "\"" + String.fromCharCode(this.rawData[0]) + "\"";
            } else {
                this.type = FieldType.TYPE_BOOL;
                this.dataValue = this.rawData[0] != 0x00;
                this.dataString = this.dataValue.toString();
            }
        } else if (this.alignedSize() == 8 && (this.rawData[this.alignmentSkip() + 0] == 0x00 || this.rawData[this.alignmentSkip() + 0] == 0x01) 
            && (this.rawData[this.alignmentSkip() + 4] == 0x00 || this.rawData[this.alignmentSkip() + 4] == 0x01)) {
            this.type = FieldType.TYPE_TWOBOOL;
            this.dataValue = [this.rawData[this.alignmentSkip() + 0] != 0x00, this.rawData[this.alignmentSkip() + 4] != 0x00];
            this.dataString = "[" + this.dataValue[0].toString() + ", " + this.dataValue[1].toString() + "]";
        } else if (this.alignedSize() == 4) {
            this.type = FieldType.TYPE_INT;
            const tempArr = this.rawData.slice(this.alignmentSkip(), this.alignmentSkip() + 4);
            const tempInt = new Reader(tempArr).readInt32();

            this.dataValue = tempInt;
            this.dataString = tempInt.toString();
            if (behavior == UnhashBehavior.UNHASH || behavior == UnhashBehavior.POUNDUNHASH) {
                const unHashed = DsonTypes.NAME_TABLE.get(tempInt);
                if (unHashed != null) {
                    this.hashedValue = this.dataString;
                    this.dataValue = (behavior == UnhashBehavior.POUNDUNHASH) ? ("###" + unHashed) : ("" + unHashed)
                    this.dataString = "\"" + this.dataValue + "\"";
                }
            }
        } else if (this.parseString()) {
            // Some strings are actually embedded files
            if (this.dataString.length >= 6) {
                const unquoteData = this.rawData.slice(this.alignmentSkip() + 4, this.rawData.length);
                const tempHeader = new Reader(unquoteData).readInt32();
                if (tempHeader == MAGIC_NUMBER) {
                    this.type = FieldType.TYPE_FILE;
                    this.embeddedFile = new DsonFile(new Reader(unquoteData), behavior);
                    this.dataString = "MUST REBUILD MANUALLY WITH CORRECT INDENTATION";
                    return true;
                }
            }
            this.dataString = this.dataString.replaceAll("\n", "\\\\n");
        } else {
            return false;
        }

        return true;
    }

    private parseHardcodedType(behavior:UnhashBehavior):boolean {
        return this.parseFloatArray() ||
            this.parseIntVector(behavior) ||
            this.parseStringVector() ||
            this.parseFloat() ||
            this.parseTwoInt();
    }

    // * Have not validated as I can't find fields that fit. should work tho
    private parseTwoInt(): boolean {
        if (DsonTypes.isA(FieldType.TYPE_TWOINT, this.nameIterator())) {
            if (this.alignedSize() == 8) {
                this.type = FieldType.TYPE_TWOINT;
                const tmpArr = this.rawData.slice(this.alignmentSkip(), this.alignmentSkip() + 8);
                const buf = new Reader(tmpArr);
                this.dataValue = [buf.readInt32(), buf.readInt32()];
                this.dataString = "[" + this.dataValue[0] + ", " + this.dataValue[1] + "]";
                return true;
            }
        }
        return false;
    }

    private parseFloat(): boolean {
        if (DsonTypes.isA(FieldType.TYPE_FLOAT, this.nameIterator())) {
            if (this.alignedSize() == 4) {
                this.type = FieldType.TYPE_TWOINT;
                const tmpArr = this.rawData.slice(this.alignmentSkip(), this.alignmentSkip() + 4);
                const buf = new Reader(tmpArr);
                this.dataValue = buf.readFloat32();
                this.dataString = "" + this.dataValue;
                return true;
            }
        }
        return false;
    }

    private parseStringVector(): boolean {
        if (DsonTypes.isA(FieldType.TYPE_STRINGVECTOR, this.nameIterator())) {
            this.type = FieldType.TYPE_STRINGVECTOR;
            const tempArr = this.rawData.slice(this.alignmentSkip(), this.alignmentSkip() + 4);
            const arrLen = new Reader(tempArr).readInt32();
            // read the rest
            const strings = this.rawData.slice(this.alignmentSkip() + 4, this.alignmentSkip() + this.alignedSize());
            const bf = new Reader(strings);
            this.dataValue = [];
            let sb = "";
            sb += "[";

            for (let i = 0; i < arrLen; i++) {
                let strlen = bf.readInt32();
                const tempArr2 = this.rawData.slice(this.alignmentSkip() + 4 + bf.offset, this.alignmentSkip() + 4 + bf.offset + strlen - 1);
                const strVal = decoder.decode(tempArr2);

                this.dataValue.push(strVal);

                sb += "\"" + strVal.replaceAll("\n", "\\\\n") + "\"";
                bf.seek(bf.offset + strlen);
                if (i < arrLen - 1) {
                    // Skip for alignment, but only if we have things following
                    bf.seek(bf.offset + ((4 - (bf.offset % 4)) % 4));
                    sb += ", ";
                }
            }

            sb += "]";
            this.dataString = sb;
            return true;
        }
        return false;
    }

    private parseIntVector(behavior:UnhashBehavior): boolean {
        if (DsonTypes.isA(FieldType.TYPE_INTVECTOR, this.nameIterator())) {
            const tempArr = this.rawData.slice(this.alignmentSkip(), this.alignmentSkip() + 4);
            const arrLen = new Reader(tempArr).readInt32();
            if (this.alignedSize() == (arrLen + 1) * 4) {
                this.type = FieldType.TYPE_INTVECTOR;
                const tempArr2 = this.rawData.slice(this.alignmentSkip() + 4, this.alignmentSkip() + 4 + (arrLen + 1) * 4);

                const buffer = new Reader(tempArr2);
                let sb = "";
                let hsb = "";

                sb += "[";
                hsb += "[";

                this.dataValue = [];
                let foundHashed = false;

                for (let i = 0; i < arrLen; i++) {
                    let tempInt = buffer.readInt32();
                    let unHashed:string;

                    if ((behavior == UnhashBehavior.UNHASH || behavior == UnhashBehavior.POUNDUNHASH) && (unHashed = DsonTypes.NAME_TABLE.get(tempInt)) != null) {
                        unHashed = (behavior == UnhashBehavior.POUNDUNHASH) ? ("###" + unHashed) : ("" + unHashed)
                        const strUnHashed = "\"" + unHashed + "\"";
                        sb += strUnHashed;
                        this.dataValue.push(unHashed);
                        hsb += tempInt;
                        foundHashed = true;
                    } else {
                        sb += tempInt;
                        this.dataValue.push(tempInt);
                        hsb += tempInt;
                    }
                    if (i != arrLen - 1) {
                        sb += ", ";
                        hsb += ", ";
                    }
                }
                sb += "]";
                hsb += "]";

                this.dataString = sb.toString();

                if (foundHashed) {
                    this.hashedValue = hsb.toString();
                }

                return true;
            }
        }
        return false;
    }

    // * Have not validated as I can't find fields that fit. should work tho
    private parseFloatArray(): boolean {
        if (DsonTypes.isA(FieldType.TYPE_FLOATARRAY, this.nameIterator())) {
            this.type = FieldType.TYPE_FLOATARRAY;
            const floats = this.rawData.slice(this.alignmentSkip(), this.alignmentSkip() + this.alignedSize())
            const buf = new Reader(floats);
            
            this.dataValue = [];
            let res = "";
            res += "[";

            while (buf.remaining() > 0) {
                const f = buf.readFloat32();
                this.dataValue.push(f);
                res += f;

                if (buf.remaining() > 0) {
                    res += ", ";
                }
            }
            
            res += "]";
            this.dataString = res;
            return true;
        }
        return false;
    }

    private parseString(): boolean {
        if (this.alignedSize() >= 5) {
            const tmpArr = this.rawData.slice(this.alignmentSkip(), this.alignmentSkip() + 4)
            const buf = new Reader(tmpArr);
            const strlen = buf.readInt32();
            
            if (this.alignedSize() == 4 + strlen) {
                this.type = FieldType.TYPE_STRING;
                const tmpArr2 = this.rawData.slice(this.alignmentSkip()+4, this.alignmentSkip()+4+strlen-1);
                this.dataValue = decoder.decode(tmpArr2);
                this.dataString = "\"" + this.dataValue + "\"";
                return true;
            }
        }
        return false;
    }

    private rawSize():number {
        return this.rawData.length;
    }
    
    private alignedSize():number {
        return this.rawSize() - this.alignmentSkip();
    }

    private alignmentSkip():number {
        return (4 - (this.dataStartInFile % 4)) % 4;
    }

    /**
     * Adds a child field if there is space available
     * @param child The child to add
     * @returns True if child was added
     */
    addChild(child:DsonField): boolean {
        if (this.children.length < this.numChildren) {
            this.children.push(child);
            child.parent = this;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Sets this field's number of children
     * @param numChildren The number of children
     */
    setNumChildren(numChildren:number): void { this.numChildren = numChildren; }

    /**
     * Checks if this field has all of its child fields
     * @returns True if this field has all of its child fields
     */
    hasAllChildren(): boolean { return this.children.length == this.numChildren; }

    private nameIterator() {
        return new FieldIteratorGenerator(this);
    }
}

/**
 * An IteratorGenerator for FieldIterators
 */
class FieldIteratorGenerator implements IteratorGenerator {
    private field:{name:string, parent:DsonField};

    constructor(field:DsonField) {
        this.field = {name: field.name, parent: field.parent};
    }

    get() {
        return new FieldIterator(this.field);
    }
}

/**
 * An Iterator for DsonField hierarchies
 */
class FieldIterator implements Iterator {
    private field:{name:string, parent:DsonField};

    constructor(field:{name:string, parent:DsonField}) {
        this.field = field;
    }
    hasNext():boolean {
        return this.field != null;
    }
    next():string {
        const f = this.field.name;
        this.field = this.field.parent ? {name: this.field.parent.name, parent: this.field.parent.parent} : null;
        return f;
    }
}