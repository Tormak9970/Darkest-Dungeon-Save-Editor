<script lang="ts">
    export let title:string;
    export let width:string = "100%";
    export let height:string = "auto";
    export let fillParent:boolean = false;
</script>

<div class="pane" style="width: calc({width} - 42px); height: {height};{fillParent ? " flex: 1;" : ""}">
    <div class="title-cont">
        <div class="title">{title}</div>
        <div class="border-blocker" />
    </div>
    <slot />
</div>

<style>
    @import "/theme.css";

    .pane {
        border: 1px solid #000;
        box-shadow: 0 0 4px rgb(0 0 0 / 50%);
        padding: 14px;
        margin: 7px;

        position: relative;

        width: calc(100% - 42px);

        background-color: var(--foreground);
    }

    .pane > .title-cont {
        position: absolute;
        top: -12px;
        left: 7px;
        font-size: 13px;
    }

    .title { z-index: 1; }

    .pane .border-blocker {
        z-index: -1;
        position: absolute;
        top: calc(50% - 1px);
        left: 0px;
        font-size: 13px;

        height: 2px;
        width: 100%;
        background-color: var(--foreground);
    }
</style>