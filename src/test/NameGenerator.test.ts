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
import { NameGenerator } from "../lib/utils/NameGenerator";

describe("Test Suite for NameGenerator class", () => {
    const testGenerator = new NameGenerator();

    test("findNames Tests", async () => {
        const names = await testGenerator.findNames(["C:\\Program Files (x86)\\Steam\\steamapps\\common\\DarkestDungeon"]);

        expect(names.size).toEqual(2120);
    });
});