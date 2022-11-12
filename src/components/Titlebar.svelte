<!--
 DarkestDungeon Save Editor is a tool for viewing and modifying DarkestDungeon game saves.
 Copyright (C) 2022 Travis Lane (Tormak)
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program. If not, see <https://www.gnu.org/licenses/>
 -->
<script lang="ts">
    import { fs, path } from "@tauri-apps/api";
    import { appWindow } from '@tauri-apps/api/window';
    import { onMount } from 'svelte';
    import { AppController } from "../lib/controllers/AppController";
    import { ToasterController } from "../lib/controllers/ToasterController";
    import { SettingsManager } from "../lib/utils/SettingsManager";
    import { appDataDir, fileNamesPath, gameDataDirPath, modDataDirPath, saveDirPath, selectedTab } from "../Stores";

    let minimize:HTMLDivElement;
    let maximize:HTMLDivElement;
    let close:HTMLDivElement;

    let isMaxed = false;

    onMount(async () => {
        minimize.addEventListener('click', () => appWindow.minimize());
        maximize.addEventListener('click', () => {
            appWindow.toggleMaximize();
            isMaxed = !isMaxed;
        });
        close.addEventListener('click', () => appWindow.close());

        await SettingsManager.setSettingsPath();
		let settings:AppSettings = JSON.parse(await fs.readTextFile(SettingsManager.settingsPath));
		
        $appDataDir = settings.appDataDir == "" ? (await path.appDir()) : settings.appDataDir;
        $fileNamesPath = await path.join($appDataDir, "filenames.txt");
        $saveDirPath = settings.saveDir;
        $gameDataDirPath = settings.gameDataDir;
        $modDataDirPath = settings.modDataDir;

        saveDirPath.subscribe(async (newVal:string) => {
            await SettingsManager.updateSettings({
                prop: "saveDir",
                data: newVal
            });
        });
        gameDataDirPath.subscribe(async (newVal:string) => {
            await SettingsManager.updateSettings({
                prop: "gameDataDir",
                data: newVal
            });
        });
        modDataDirPath.subscribe(async (newVal:string) => {
            await SettingsManager.updateSettings({
                prop: "modDataDir",
                data: newVal
            });
        });
        selectedTab.subscribe(async (newVal:string) => {
            await SettingsManager.updateSettings({
                prop: "selectedTab",
                data: newVal
            });
        });

        await AppController.init();
        
        if ($saveDirPath != "") {
            if ($gameDataDirPath == "") {
                // TODO show toast to prompt user to choose directory
                ToasterController.showGenericToast("Please select a game data directory", {
                    "--toastWidth": "400px"
                });
            } else {
                // @ts-ignore
                if (!(await fs.exists($fileNamesPath)) && $gameDataDirPath != "") {
                    await AppController.generateNames($gameDataDirPath, $modDataDirPath);
                } else {
                    await AppController.updateNames();
                }
                await AppController.loadSaves();
            }
        }
    });
</script>

<div data-tauri-drag-region class="titlebar">
    <div class="info">
        <img src="/logo.png" alt="logo" height="25" style="margin-left: 7px;">
        <div style="margin-left: 10px; margin-right: 30px;">Darkest Dungeon Save Editor</div>
    </div>
    <div class="btns">
        <div bind:this="{minimize}" class="titlebar-button" id="titlebar-minimize">
            <svg width="10" height="2" viewBox="0 0 11 2">
                <path d="m11 0v1h-11v-1z" stroke-width="0.25" style="fill: white;"/>
            </svg>
        </div>
        <div bind:this="{maximize}" class="titlebar-button" id="titlebar-maximize">
            {#if isMaxed}
                <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="m10-1.667e-6v10h-10v-10zm-1.001 1.001h-7.998v7.998h7.998z" stroke-width=".25" style="fill: white;"/>
                </svg>
            {:else}
                <svg width="11" height="11" viewBox="0 0 11 11">
                    <path d="m11 8.7978h -2.2021v 2.2022h -8.7979v -8.7978h 2.2021v -2.2022h 8.7979z m-3.2979 -5.5h -6.6012v 6.6011h 6.6012z m2.1968 -2.1968h -6.6012v 1.1011h 5.5v 5.5h 1.1011z" stroke-width=".275" style="fill: white;"/>
                </svg>
            {/if}
        </div>
        <div bind:this="{close}" class="titlebar-button" id="titlebar-close">
            <!-- svelte-ignore a11y-missing-attribute -->
            <img src="/img/CloseWindow.png" height="20" />
        </div>
    </div>
</div>

<style>
    @import "/theme.css";

    .titlebar {
        height: 30px;
        width: 100%;
        
        background: var(--foreground);
        user-select: none;
        display: inline-flex;
        justify-content: space-between;
        font-size: 14px;
    }
    .info {
        display: flex;
        align-items: center;
    }
    .btns {
        display: flex;
    }
    .titlebar-button {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 47px;
        height: 30px;
    }
    .titlebar-button:hover {
        background: var(--hover);
    }
</style>