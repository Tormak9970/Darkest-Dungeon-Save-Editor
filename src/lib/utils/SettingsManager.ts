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

export class SettingsManager {
    static settingsPath = "";

    static async setSettingsPath() {
        const appDir = await path.appDir();
        // @ts-ignore
        if (!(await fs.exists(appDir))) {
            await fs.createDir(appDir);
        }
        const setsPath = await path.join(await path.appDir(), "settings.json");
        await fs.readTextFile(setsPath).then(() => {}, async () => {
            await fs.copyFile(await path.join(await path.resourceDir(), "_up_", "settings.json"), setsPath);
        });
        SettingsManager.settingsPath = setsPath;
    }

    static async updateSettings(data: { prop: string, data: any }) {
        const settingsData = await fs.readTextFile(SettingsManager.settingsPath);

        const settings = JSON.parse(settingsData);
        settings[data.prop] = data.data;

        await fs.writeFile({
            path: SettingsManager.settingsPath, 
            contents: JSON.stringify(settings)
        });
    }
}