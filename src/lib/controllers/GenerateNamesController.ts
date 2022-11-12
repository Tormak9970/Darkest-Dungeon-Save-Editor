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
import { fs, path } from "@tauri-apps/api";
import { NameGenerator } from "../utils/NameGenerator";

/**
 * The controller class for field name finding
 */
export class GenerateNamesController {
    private DDSteamDir = "262060";
    nameGenerator:NameGenerator = new NameGenerator();

    /**
     * Finds save file field names by parsing DarkestDungeon game data and mod data
     * @param gamePath The gameData path
     * @param modPath The modData path, if specified
     * @returns A set of names found
     */
    async generateNames(gamePath:string, modPath:string): Promise<Set<string>> {
        const paths = []
        if (gamePath != "") {
            const revisionsPath = await path.join(gamePath, "svn_revision.txt")
            if (fs.exists(revisionsPath)) {
                paths.push(gamePath);
            } else {
                throw new Error("Expected game path to point to game data, but missing svn_revision.txt");
            }
        }

        if (modPath != "") {
            if (modPath.includes(this.DDSteamDir)) {
                paths.push(modPath);
            } else {
                throw new Error("Expected mod path to include game dir (262060)");
            }
        }

        const names = this.nameGenerator.findNames(paths);
        return names;
    }
}