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

import { describe, test, expect} from "vitest";
import fs from "fs";
import path from "path";
import { Reader } from "../lib/utils/Reader";
import { Dson } from "../lib/models/Dson";

describe("Test Suite for Dson class", () => {
    const buffer = fs.readFileSync(path.join(__dirname, "test-resources", "persist.estate.json"));
    const reader = new Reader(buffer.buffer);

    const testDson = new Dson(reader);
    const header = testDson.header;
    const meta1Block = testDson.meta1Block;
    const meta2Block = testDson.meta2Block;
    const data = testDson.data;
    console.log(data);

    test("Header Tests", () => {
        expect(header.magicNr).toEqual(0xB101);
        expect(header.revision).toEqual(25721);
        expect(header.headerLength).toEqual(64);

        expect(header.meta1Size).toEqual(320);
        expect(header.numMeta1Entries).toEqual(20);
        expect(header.meta1Offset).toEqual(64);

        expect(header.numMeta2Entries).toEqual(51);
        expect(header.meta2Offset).toEqual(384);

        expect(header.dataLength).toEqual(712);
        expect(header.dataOffset).toEqual(996);
    });

    test("Meta1Block Tests", () => {
        // console.log(meta1Block);
    });

    test("Meta2Block Tests", () => {
        // console.log(meta2Block);
    });

    test("Data Tests", () => {
        // console.log(data);
    });
});