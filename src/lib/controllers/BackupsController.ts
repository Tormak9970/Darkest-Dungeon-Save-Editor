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
import JSZip from "jszip";
import { get } from "svelte/store";
import { appDataDir, saveDirPath } from "../../Stores";
import { Utils } from "../utils/Utils";
import { ToasterController } from "./ToasterController";

type SaveData = {
    saveSlot:string,
    day: number,
    month: number,
    year: number,
    hours: number,
    minutes: number,
    seconds: number
}

export class BackupsController {
    private backupDir:string;

    constructor() {
        appDataDir.subscribe(async (dir) => {
            this.backupDir = await path.join(dir, "backups")
        });
    }

    private getBackupInfo() {
        const date = new Date();

        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        
        return {
            "day": day,
            "month": month,
            "year": year,
            "hours": hours,
            "minutes": minutes,
            "seconds": seconds
        };
    }

    private saveSchema(saveSlot:string, backupInfo: { day: number, month: number, year: number, hours: number, minutes: number, seconds: number }):string {
        const {day, month, year, hours, minutes, seconds} = backupInfo;
        return `${saveSlot}__${day}.${month}.${year}__${hours}.${minutes}.${seconds}`;
    }

    private deconstructSave(fileName:string): SaveData {
        const segs = fileName.substring(0, fileName.length-3).split("__");
        const saveSlot = segs[0];
        const [day, month, year] = segs[1].split(".");
        const [hours, minutes, seconds] = segs[2].split(".");

        return {
            "saveSlot": saveSlot,
            "day": parseInt(day),
            "month": parseInt(month),
            "year": parseInt(year),
            "hours": parseInt(hours),
            "minutes": parseInt(minutes),
            "seconds": parseInt(seconds)
        }
    }

    async backup() {
        const loaderId = ToasterController.showLoaderToast("Generating backup...");
        const saveDir = get(saveDirPath);
        const zip = new JSZip();

        const saveSlot = await path.basename(saveDir);
        const zipName = `${this.saveSchema(saveSlot, this.getBackupInfo())}.zip`;

        const saveConts = await fs.readDir(saveDir);

        for (let i = 0; i < saveConts.length; i++) {
            const saveFilePath = saveConts[i];
            
            if (Utils.isSaveFile(saveFilePath.name)) {
                const name = saveFilePath.name;
                const data = await fs.readBinaryFile(saveFilePath.path);
                
                zip.file(name, data);
            }
        }

        const zipData = await zip.generateAsync({ type: "arraybuffer" });
        await fs.writeBinaryFile(await path.join(this.backupDir, zipName), zipData);

        ToasterController.remLoaderToast(loaderId);
        
        setTimeout(() => {
            ToasterController.showSuccessToast("Backup complete!");
        }, 500);
    }

    async loadBackups() {

    }
}