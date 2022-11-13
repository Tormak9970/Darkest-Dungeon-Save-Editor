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
    import { open } from '@tauri-apps/api/shell';
    import Button from "../interactable/Button.svelte";
    import Pane from "../layout/Pane.svelte";

    export let show:boolean = false;
    export let closeFunc:()=>void;

    function openLink(link:string) {
        open(link);
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="background" class:show={show} on:click={closeFunc}>
    <div class="confirm-modal">
        <Pane width={"calc(100% - 34px)"}>
            <div class="header">
                About
            </div>
            <div class="message">
                Darkest Dungeon Save Editor is a tool for viewing and modifying game saves.<br/>
                The file reading is based on an old save editor by robojumper<br/>
                <!-- svelte-ignore a11y-invalid-attribute -->
                (you can find it <a href="" on:click={() => { openLink("https://github.com/robojumper/DarkestDungeonSaveEditor/")}}>here</a>)
            </div>
            <div class="header">
                Licensing
            </div>
            <div class="message">
                Copyright (C) 2022 Travis Lane (Tormak)<br/>
                <br/>
                This program is free software: you can redistribute it and/or modify<br/>
                it under the terms of the GNU General Public License as published by<br/>
                the Free Software Foundation, either version 3 of the License, or<br/>
                (at your option) any later version.<br/>
                <br/>
                This program is distributed in the hope that it will be useful,<br/>
                but WITHOUT ANY WARRANTY; without even the implied warranty of<br/>
                MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the<br/>
                GNU General Public License for more details.<br/>
                <br/>
                You should have received a copy of the GNU General Public License<br/>
                <!-- svelte-ignore a11y-invalid-attribute -->
                along with this program. If not, see <a href="" on:click={() => { openLink("https://www.gnu.org/licenses/")}}>https://www.gnu.org/licenses/</a>
            </div>
            <div class="buttons">
                <Button text={"Close"} onClick={closeFunc} />
            </div>
        </Pane>
    </div>
</div>

<style>
    @import "/theme.css";

    .background {
        font-size: 12px;
        z-index: 2;
        top: 30px;
        position: absolute;
        background-color: rgba(0, 0, 0, 0.6);
        width: 100%;
        height: 100%;
        display: none;
    }

    .show {
        display: flex;
    }

    .confirm-modal {
        width: 450px;
        margin: auto;
    }

    .header {
        text-align: center;
        font-size: 18px;
    }

    .buttons {
        margin-top: 14px;
        width: 100%;
        display: flex;
        justify-content: space-around;
    }

    a {
        color: #58a6ff;
    }

    a:hover {
        color: #85bdfd;
    }
</style>