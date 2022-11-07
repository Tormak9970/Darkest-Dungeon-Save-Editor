<script lang="ts">
    export let text: string;
    export let width = "40px";
    export let onClick: (e: MouseEvent) => void;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<button class="button" style="width: {width};" on:click={onClick}>
    <div>{text}</div>
</button>

<style>
    @import "/theme.css";

    .button {
        padding: 3px 6px;
        min-width: 40px;
        
        background-color: var(--background);
        border: 1px solid #000;
        border-radius: 1px;

        display: flex;
        align-items: center;
        justify-content: center;

        font-size: 12px;
        cursor: pointer;
    }

    .button:hover {
        background-color: var(--background-hover);
    }

    .button:focus {
        border: 1px solid var(--highlight);
    }
</style>
