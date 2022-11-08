<script lang="ts">
    import { onMount } from "svelte";
    import { throttle } from "../../lib/utils/Utils";
    import { tabs } from "../../Stores";
    import JsonEditor from "../JsonEditor.svelte";
    import Tab from "./Tab.svelte";

    let tabsElem:HTMLDivElement;
    let tabsContElem:HTMLDivElement;
    let contContElem:HTMLDivElement;

    let oldHeight = null;

    function hardSetResize() {
        let windowHeight = window.innerHeight;
        let heightToSet = tabsElem.clientHeight;
        if (oldHeight) {
            if (oldHeight > windowHeight) {
                heightToSet -= (oldHeight - windowHeight);
            }
        }

        tabsContElem.style.height = `${heightToSet}px`;
        contContElem.style.height = `${heightToSet}px`;

        oldHeight = windowHeight;
    }

    onMount(() => {
        hardSetResize();
    });
</script>

<svelte:window on:resize={throttle(hardSetResize, 50)} />

<div class="tabs" bind:this={tabsElem}>
    <div class="tabs-cont" bind:this={tabsContElem}>
        <div class="scroller">
            {#each Object.entries($tabs) as tab}
                <Tab label={tab[0]} />
            {/each}
        </div>
    </div>
    <div class="cont-cont" bind:this={contContElem}>
        <JsonEditor />
    </div>
</div>

<style>
    @import "/theme.css";

    .tabs {
        height: 100%;
        max-width: 100%;
        display: flex;
        flex-direction: row;
    }

    .tabs-cont {
        overflow: scroll;
        margin-right: 7px;
    }

    .cont-cont {
        background-color: var(--background);
        flex: 1;
    }
</style>