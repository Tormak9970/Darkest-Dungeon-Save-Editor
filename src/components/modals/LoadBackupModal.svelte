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
    import { fs } from "@tauri-apps/api";
    import { onMount } from "svelte";
    import { AppController } from "../../lib/controllers/AppController";
    import { showLoadBackupModal } from "../../Stores";
    import Button from "../interactable/Button.svelte";
    import Pane from "../layout/Pane.svelte";
    import BackupEntry from "./BackupEntry.svelte";

    $: backups = [];


    function close() {
        $showLoadBackupModal = false;
    }

    onMount(async () => {
        showLoadBackupModal.subscribe(async (val) => {
            if (val) {
                backups = [];

                const backupConts = await fs.readDir(AppController.backupsController.getBackupDir());

                for (let i = 0; i < backupConts.length; i++) {
                    const backupFile = backupConts[i];
                    
                    backups.push(backupFile);
                }
            }

            backups = [...backups];
        })
    });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="background" class:show={$showLoadBackupModal} on:click={close}>
    <div class="load-backup-modal">
        <Pane title={"Choose a backup to recover"}>
            <div class="backups-cont">
                {#each backups as backup}
                    <BackupEntry backupFile={backup} />
                {/each}
            </div>
            <div class="buttons">
                <Button text={"Cancel"} onClick={close} width={"100%"} />
            </div>
        </Pane>
    </div>
</div>

<style>
    @import "/theme.css";

    .background {
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

    .load-backup-modal {
        margin: auto;
    }

    .backups-cont {
        background-color: var(--background);

        display: flex;
        flex-direction: column;
        justify-content: flex-start;

        padding-top: 7px;
    }

    .buttons {
        margin-top: 14px;
        width: 100%;
        display: flex;
        justify-content: space-around;
    }
</style>