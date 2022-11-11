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
    import type { FileEntry } from "@tauri-apps/api/fs";
    import { onMount } from "svelte";
    import { showLoadBackupModal } from "../../Stores";


    export let backupFile:FileEntry;

    function close() {
        $showLoadBackupModal = false;
    }

    onMount(() => {

    });
</script>

<div class="backup-entry">

</div>

<style>
    @import "/theme.css";

    .backup-entry {
        width: 400px;
        height: 40px;

        background-color: var(--foreground);
    }
</style>