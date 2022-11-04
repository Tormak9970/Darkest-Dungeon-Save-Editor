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
import type { DsonFile } from "./DsonFIle";
import type { UnhashBehavior } from "./UnhashBehavior";

export class DsonField {
    dataStartInFile:number;
    dataOffRelToData:number;
    meta1EntryIdx = -1;
    meta2EntryIdx = -1;

    name:string;
    type:any;

    rawData:Uint8Array;
    dataString = "\"UNKNOWN. PLEASE PARSE TYPE\"";
    hasedValue:string;
    embeddedFile:DsonFile;

    numChildren:number;
    children:DsonField[];

    constructor(reader?:Reader) {
        this.children = [];
    }

    guessType(behavior:UnhashBehavior): boolean {

    }

    private rawSize():number { return this.rawData.length; }
    private alignedSize():number { return this.rawSize() - this.alignedSkip(); }
    private alignedSkip():number { return (4 - (this.dataOffRelToData % 4)) % 4; }

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
}