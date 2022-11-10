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
	import { SvelteToast } from "@zerodevx/svelte-toast";
    import Button from "./components/interactable/Button.svelte";
    import Pane from "./components/layout/Pane.svelte";
    import PathField from "./components/interactable/PathField.svelte";
    import Tabs from "./components/tabs/Tabs.svelte";
	import Titlebar from "./components/Titlebar.svelte";
    import { AppController } from "./lib/controllers/AppController";
    
    import { gameDataDirPath, loaderProgress, modDataDirPath, saveDirPath } from "./Stores";
    import ProgressBar from "./components/info/ProgressBar.svelte";
    import { ToasterController } from "./lib/controllers/ToasterController";

    async function loadSave(e:Event) {
        if ($gameDataDirPath == "") {
            ToasterController.showGenericToast("Please select a game data directory first", {
                "--toastWidth": "360px"
            });
        } else {
            const path = (e.currentTarget as HTMLInputElement).value;
            $saveDirPath = path;
            await AppController.loadSave();
        }
    }

    async function loadGameData(e:Event) {
        const path = (e.currentTarget as HTMLInputElement).value;
        $gameDataDirPath = path;
        
        ToasterController.showGenericToast("Consider running find names", {
            "--toastWidth": "270px"
        });
    }

    async function loadModData(e:Event) {
        const path = (e.currentTarget as HTMLInputElement).value;
        $modDataDirPath = path;
        
        ToasterController.showGenericToast("Consider running find names", {
            "--toastWidth": "270px"
        });
    }

    async function confirmDiscard(e:Event) {

    }

    async function discardChanges() {

    }

    async function saveChanges(e:Event) {
        await AppController.saveChanges();
    }

    function makeBackup(e:Event) {

    }

    function loadBackup(e:Event) {

    }

    async function findNames(e:Event) {
        await AppController.generateNames($gameDataDirPath, $modDataDirPath);
    }
</script>

<div class="wrap">
	<SvelteToast target="top" options={{ initial: 0, intro: { y: -64 } }} />
</div>
<main>
	<Titlebar />
	<div class="content">
        <Pane title="Paths">
            <div class="row" style="margin-top: 0px;">
                <PathField fieldName="Save Directory" title={"Select a save directory"} defaultPath={$saveDirPath} cVal={$saveDirPath} handler={loadSave} />
                <div style="height: 1px; width: 7px;" />
                <Button text={"Make Backup"} onClick={makeBackup} width={"100px"} />
            </div>
            <div class="row">
                <PathField fieldName="Game Data" title={"Select your game data directory"} defaultPath={$gameDataDirPath} cVal={$gameDataDirPath} handler={loadGameData} />
                <div style="height: 1px; width: 7px;" />
                <Button text={"Load Backup"} onClick={loadBackup} width={"100px"} />
            </div>
            <div class="row">
                <PathField fieldName="Mod Data" title={"Select your mod data directory"} defaultPath={$modDataDirPath}  cVal={$modDataDirPath} handler={loadModData} />
                <div style="height: 1px; width: 7px;" />
                <Button text={"Find Names"} onClick={findNames} width={"100px"} />
            </div>
        </Pane>
        <Pane title="Save Data" fillParent>
            <Tabs />
        </Pane>
        <Pane padding={"7px"}>
            <div class="bottom-panel">
                <ProgressBar width={"300px"} progress={$loaderProgress} />
                <div style="width: 7px; height: 1px;" />
                <Button text={"Discard Changes"} onClick={confirmDiscard} width={"120px"} />
                <div style="width: 7px; height: 1px;" />
                <Button text={"Save Changes"} onClick={saveChanges} width={"100px"} />
            </div>
        </Pane>
	</div>
</main>
<SvelteToast />

<style>
    @import "/theme.css";

    main {
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;

        color: var(--font-color);
    }

    .wrap {
        --toastContainerTop: 0.5rem;
        --toastContainerRight: 0.5rem;
        --toastContainerBottom: auto;
        --toastContainerLeft: 0.5rem;
        --toastWidth: 100%;
        --toastMinHeight: 100px;
        --toastPadding: 0 0.5rem;
        font-size: 0.875rem;
    }
    @media (min-width: 40rem) {
        .wrap {
            --toastContainerRight: auto;
            --toastContainerLeft: calc(50vw - 20rem);
            --toastWidth: 40rem;
        }
    }

    .row {
        margin-top: 7px;

        display: flex;
        align-items: center;
    }

    .content {
        margin-top: 5px;
        width: 100%;
        height: calc(100% - 35px);

        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
    }

    .bottom-panel {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
    }
</style>