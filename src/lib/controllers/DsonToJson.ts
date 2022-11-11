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
import fs from "fs";
import { Reader } from "../utils/Reader";
import { DsonFile } from "../models/DsonFile";
import { UnhashBehavior } from "../models/UnhashBehavior";

export class DsonToJsonController {
    constructor(path:string, output:string) {
        const buffer = fs.readFileSync(path);
        const reader = new Reader(buffer.buffer);

        const testDson = new DsonFile(reader, UnhashBehavior.POUNDUNHASH);
        const header = testDson.header;
        const meta1Block = testDson.meta1Block;
        const meta2Block = testDson.meta2Block;
        const data = testDson.data;
        fs.writeFileSync(output, JSON.stringify(testDson));
    }
}