<script lang="ts">
    import { tabs } from "../../Stores";
    import JsonEditor from "../JsonEditor.svelte";
    import Tab from "./Tab.svelte";
</script>

<div class="tabs">
    <div class="tabs-cont">
        {#each Object.entries($tabs) as tab}
            <Tab label={tab[0]} />
        {/each}
    </div>
    <div class="cont-cont">
        <JsonEditor />
    </div>
</div>

<style>
    @import "/theme.css";

    .tabs {
        height: 100%;
        display: flex;
    }

    .tabs-cont {
        height: 100%;
        margin-right: 7px;
    }

    .cont-cont {
        height: 100%;
        background-color: var(--background);
        overflow: scroll;
        flex: 1;
    }
</style>