<script lang="ts">
    import { selectedTab } from "../../Stores";

    export let label:string;

    function select(e:Event) {
        $selectedTab = label;
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="tab" class:selected={$selectedTab == label} on:click={select}>
    <div>{label}</div>
</div>

<style>
    @import "/theme.css";

    .tab {
        display: flex;
        font-size: 12px;
        flex: 1;
        width: calc(100% - 7px);
        min-width: 100px;

        border: 1px solid black;
        background-color: var(--background);
        margin-bottom: 3px;
        padding-left: 7px;

        cursor: pointer;
    }

    .tab:hover {
        background-color: var(--background-hover);
    }

    .selected {
        border: 1px solid var(--highlight-hover);
    }
</style>