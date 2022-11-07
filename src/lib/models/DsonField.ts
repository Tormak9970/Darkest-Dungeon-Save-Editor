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
import { DsonFile, MAGIC_NUMBER } from "./DsonFile";
import { DsonTypes, FieldType } from "./DsonTypes";
import { UnhashBehavior } from "./UnhashBehavior";

const decoder = new TextDecoder();

export class DsonField {
    static STR_TRUE = "true";
    static STR_FALSE = "false";

    dataStartInFile:number;
    dataOffRelToData:number;
    meta1EntryIdx = -1;
    meta2EntryIdx = -1;

    name:string;
    type:any;
    parent:DsonField;

    rawData:Uint8Array;
    dataString = "\"UNKNOWN. PLEASE PARSE TYPE\"";
    hashedValue:string;
    embeddedFile:DsonFile;

    numChildren:number;
    children:DsonField[];

    constructor() {
        this.children = [];
    }

    guessType(behavior:UnhashBehavior): boolean {
        if (this.parseHardcodedType(behavior)) {
            return true;
        } else if (this.rawData.length == 1) {
            if (this.rawData[0] >= 0x20 && this.rawData[0] <= 0x7E) {
                this.type = FieldType.TYPE_CHAR;
                this.dataString = "\"" + String.fromCharCode(this.rawData[0]) + "\"";
            } else {
                this.type = FieldType.TYPE_BOOL;
                this.dataString = this.rawData[0] == 0x00 ? DsonField.STR_FALSE : DsonField.STR_TRUE;
            }
        } else if (this.alignedSize() == 8 && (this.rawData[this.alignmentSkip() + 0] == 0x00 || this.rawData[this.alignmentSkip() + 0] == 0x01) && (this.rawData[this.alignmentSkip() + 4] == 0x00 || this.rawData[this.alignmentSkip() + 4] == 0x01)) {
            this.type = FieldType.TYPE_TWOBOOL;
            this.dataString = "[" + (this.rawData[this.alignmentSkip() + 0] == 0x00 ? DsonField.STR_FALSE : DsonField.STR_TRUE) + ", " + (this.rawData[this.alignmentSkip() + 4] == 0x00 ? DsonField.STR_FALSE : DsonField.STR_TRUE) + "]";
        } else if (this.alignedSize() == 4) {
            this.type = FieldType.TYPE_INT;
            const tempArr = new Uint8Array(this.rawData, this.alignmentSkip(), 4);
            const tempInt = new Reader(tempArr).readInt32();
            this.dataString = tempInt.toString();
            if (behavior == UnhashBehavior.UNHASH || behavior == UnhashBehavior.POUNDUNHASH) {
                const unHashed = DsonTypes.NAME_TABLE.get(tempInt);
                if (unHashed != null) {
                    this.hashedValue = this.dataString;
                    this.dataString = (behavior == UnhashBehavior.POUNDUNHASH) ? ("\"###" + unHashed + "\"") : ("\"" + unHashed + "\"");
                }
            }
        } else if (this.parseString()) {
            // Some strings are actually embedded files
            if (this.dataString.length >= 6) {
                const unquoteData = new Uint8Array(this.rawData, this.alignmentSkip() + 4, this.rawData.length - this.alignmentSkip() + 4);
                const tempHeader = new Reader(new Uint8Array(unquoteData, 0, 4)).readInt32();
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
        return this.parseFloatArray() || this.parseIntVector(behavior) || this.parseStringVector() || this.parseFloat() || this.parseTwoInt();
    }

    private parseTwoInt(): boolean {
        if (DsonTypes.isA(FieldType.TYPE_TWOINT, this.nameIterator())) {
            if (this.alignedSize() == 8) {
                this.type = FieldType.TYPE_TWOINT;
                const tmpArr = new Uint8Array(this.rawData.buffer, this.alignmentSkip(), 8);
                const buf = new Reader(tmpArr);
                this.dataString = "[" + buf.readInt32() + ", " + buf.readInt32() + "]";
                return true;
            }
        }
        return false;
    }

    private parseFloat(): boolean {
        if (DsonTypes.isA(FieldType.TYPE_FLOAT, this.nameIterator())) {
            if (this.alignedSize() == 4) {
                this.type = FieldType.TYPE_TWOINT;
                const tmpArr = new Uint8Array(this.rawData.buffer, this.alignmentSkip(), 4);
                const buf = new Reader(tmpArr);
                this.dataString = "" + buf.readFloat32();
                return true;
            }
        }
        return false;
    }

    private parseStringVector(): boolean {
        if (DsonTypes.isA(FieldType.TYPE_STRINGVECTOR, this.nameIterator())) {
            this.type = FieldType.TYPE_STRINGVECTOR;
            const tempArr = new Uint8Array(this.rawData, this.alignmentSkip(), 4);
            const arrLen = new Reader(tempArr).readInt32();
            // read the rest
            const strings = new Uint8Array(this.rawData, this.alignmentSkip() + 4, this.alignedSize() - 4);
            const bf = new Reader(strings);
            let sb = "";
            sb += "[";

            for (let i = 0; i < arrLen; i++) {
                let strlen = bf.readInt32();
                const tempArr2 = new Uint8Array(this.rawData, this.alignmentSkip() + 4 + bf.offset, strlen - 1);
                sb += "\"" + decoder.decode(tempArr2).replaceAll("\n", "\\\\n") + "\"";
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
            const tempArr = new Uint8Array(this.rawData.buffer, this.alignmentSkip(), 4);
            const arrLen = new Reader(tempArr).readInt32();
            if (this.alignedSize() == (arrLen + 1) * 4) {
                this.type = FieldType.TYPE_INTVECTOR;
                const tempArr2 = new Uint8Array(this.rawData.buffer, this.alignmentSkip() + 4, (arrLen + 1) * 4);

                const buffer = new Reader(tempArr2);
                let sb = "";
                let hsb = "";

                sb += "[";
                hsb += "[";

                let foundHashed = false;

                for (let i = 0; i < arrLen; i++) {
                    let tempInt = buffer.readInt32();
                    let unHashed:string;

                    if ((behavior == UnhashBehavior.UNHASH || behavior == UnhashBehavior.POUNDUNHASH) && (unHashed = DsonTypes.NAME_TABLE.get(tempInt)) != null) {
                        unHashed = (behavior == UnhashBehavior.POUNDUNHASH) ? ("\"###" + unHashed + "\"") : ("\"" + unHashed + "\"");
                        sb += unHashed;
                        hsb += tempInt;
                        foundHashed = true;
                    } else {
                        sb += tempInt;
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

    private parseFloatArray(): boolean {
        if (DsonTypes.isA(FieldType.TYPE_FLOATARRAY, this.nameIterator())) {
            this.type = FieldType.TYPE_FLOATARRAY;
            const floats = new Uint8Array(this.rawData.buffer, this.alignmentSkip(), this.alignedSize());
            const buf = new Reader(floats);
            
            let res = "";
            res += "[";

            while (buf.remaining() > 0) {
                const f = buf.readFloat32();
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
            const tmpArr = new Uint8Array(this.rawData.buffer, this.alignmentSkip(), 4);
            const buf = new Reader(tmpArr);
            const strlen = buf.readInt32();
            
            if (this.alignedSize() == 4 + strlen) {
                this.type = FieldType.TYPE_STRING;
                const tmpArr2 = new Uint8Array(this.rawData.buffer, this.alignmentSkip()+4, 4+strlen-1);
                this.dataString = "\"" + decoder.decode(tmpArr2) + "\"";
                return true;
            }
        }
        return false;
    }

    public getExtraComments(): string {
        let res = "";

        res += "Type: ";
        res += FieldType.getKeyName(this.type);

        if (this.hashedValue != null) {
            res += ", Hashed Integer(s): ";
            res += this.hashedValue;
        }

        if (JSON.stringify(this.type) == JSON.stringify(FieldType.TYPE_UNKNOWN)) {
            res += ", Raw Data: ";
            res += Buffer.from(this.rawData).toString('hex');
        }

        return res;
    }

    private rawSize():number { return this.rawData.length; }
    private alignedSize():number { return this.rawSize() - this.alignmentSkip(); }
    private alignmentSkip():number { return (4 - (this.dataOffRelToData % 4)) % 4; }

    addChild(child:DsonField): boolean {
        if (this.children.length < this.numChildren) {
            this.children.push(child);
            return true;
        } else {
            return false;
        }
    }
    setNumChildren(numChildren:number): void { this.numChildren = numChildren; }
    hasAllChildren(): boolean { return this.children.length == this.numChildren; }

    private nameIterator() {
        return new ItteratorGenerator(JSON.parse(JSON.stringify(this)));
    }

    asJson() {
        // TODO implement
    }
}

export class ItteratorGenerator {
    private field:DsonField;

    constructor(field:DsonField) {
        this.field = field;
    }

    get() {
        return new Itterator(this.field);
    }
}

export class Itterator {
    private field:DsonField;

    constructor(field:DsonField) {
        this.field = field;
    }
    hasNext():boolean {
        return this.field != null;
    }
    next():string {
        const f = this.field.name;
        this.field = this.field.parent ? this.field.parent : null;
        return f;
    }
}