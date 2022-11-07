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
import { toast } from "@zerodevx/svelte-toast";
import { get,  } from "svelte/store";
import { appDataDir, dsonFiles, saveDirPath, tabs } from "../../Stores";
import { DsonFile } from "../models/DsonFile";
import { UnhashBehavior } from "../models/UnhashBehavior";
import { Reader } from "../utils/Reader";
import { Utils } from "../utils/Utils";
import { GenerateNamesController } from "./GenerateNamesController";

export class AppController {
    static namesController = new GenerateNamesController();

    static async init() {
        const appDir = get(appDataDir);
        const backupPath = await path.join(appDir, "backups");
        // @ts-ignore
        if (!(await fs.exists( backupPath))) await fs.createDir(await path.join(appDir, "backups"));

        // TODO show toast prompting user to load gameData dir
        // toast.push("");

        // TODO show toast prompting user to gen names if no cache present
        // toast.push("");

        // TODO show toast prompting user to load save dir
        // toast.push("");
    }

    static async loadSave() {
        const saveDir = get(saveDirPath);

        const newTabs = {};
        const newDsonFiles = {};
        if (saveDir != "") {
            const saveConts = await fs.readDir(saveDir);

            for (let i = 0; i < saveConts.length; i++) {
                const saveFilePath = saveConts[i];
                // const saveFile = await path.join(saveDir, saveFilePath); //! may need this if .path doesnt work
                if (Utils.isSaveFile(saveFilePath.name)) {
                    const data = await fs.readBinaryFile(saveFilePath.path);
                    const reader = new Reader(data);
                    const dson = new DsonFile(reader, UnhashBehavior.POUNDUNHASH);

                    newTabs[saveFilePath.name] = dson.asJson();
                    newDsonFiles[saveFilePath.name] = dson;
                }
            }
        }

        tabs.set(newTabs);
        dsonFiles.set(newDsonFiles);

        console.log(newTabs);
    }

    static async backup() {
        
    }

    static async saveChanges() {

    }

    static async discardChanges() {
        
    }

    static async reload() {

    }

    static async generateNames(gamePath:string, modPath:string): Promise<void> {
        const names = await AppController.namesController.generateNames(gamePath, modPath);
        // TODO need to show progress bar as this happens

        // TODO write to file in appDir
    }
}